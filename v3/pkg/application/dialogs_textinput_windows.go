//go:build windows && !server

package application

import (
	"fmt"
	"math"
	"runtime"
	"strings"
	"unsafe"

	"github.com/wailsapp/wails/v3/pkg/w32"
)

// Windows Text Input Dialog implementation

// IDs for controls in the custom dialog
const (
	winTextDlgClass = "WailsTextInputDialog"
	ctrlIDEdit      = 1001
)

// Some message and icon constants not present in w32 wrappers
const (
	wmSetIcon = 0x0080
	iconSmall = 0
	iconBig   = 1
)

// Helper to get low/high words from WPARAM/LPARAM
func lowWord(v uintptr) uint16 { return uint16(v & 0xFFFF) }

// Small helper to apply font to a control if present
func setFontIf(hwnd w32.HWND, font w32.HFONT) {
	if font != 0 && hwnd != 0 {
		w32.SendMessage(hwnd, w32.WM_SETFONT, uintptr(font), 1)
	}
}

type windowsTextInputDialog struct {
	dialog       *TextInputDialogStruct
	result       chan string
	hwnd         w32.HWND
	parent       w32.HWND
	label        w32.HWND
	edit         w32.HWND
	okBtn        w32.HWND
	cancelBtn    w32.HWND
	icon         w32.HICON
	hFont        w32.HFONT
	hFontOwned   bool
	finishedOnce bool
}

func newTextInputDialogImpl(d *TextInputDialogStruct) *windowsTextInputDialog {
	return &windowsTextInputDialog{dialog: d}
}

// finish runs on the window thread; the buffered channel also supports
// synchronous completion inside the modal message loop.
func (m *windowsTextInputDialog) finish(text string) {
	if m.finishedOnce {
		return
	}
	m.finishedOnce = true
	m.result <- text
	close(m.result)
}

func textInputDlgWndProc(hwnd w32.HWND, msg uint32, wParam, lParam uintptr) uintptr {
	data := w32.GetWindowLongPtr(hwnd, w32.GWLP_USERDATA)
	var self *windowsTextInputDialog
	if data != 0 {
		self = (*windowsTextInputDialog)(unsafe.Pointer(data))
	}
	switch msg {
	case w32.WM_CREATE:
		cs := (*w32.CREATESTRUCT)(unsafe.Pointer(lParam))
		w32.SetWindowLongPtr(hwnd, w32.GWLP_USERDATA, cs.CreateParams)
	case w32.WM_COMMAND:
		if self != nil {
			switch lowWord(wParam) {
			case uint16(w32.IDOK):
				self.finish(w32.GetWindowText(self.edit))
				w32.DestroyWindow(hwnd)
				return 0
			case uint16(w32.IDCANCEL):
				self.finish("")
				w32.DestroyWindow(hwnd)
				return 0
			}
		}
	case w32.WM_CLOSE:
		w32.DestroyWindow(hwnd)
		return 0
	case w32.WM_DESTROY:
		if self != nil {
			self.finish("")
			if self.icon != 0 {
				w32.DestroyIcon(self.icon)
				self.icon = 0
			}
			if self.hFontOwned && self.hFont != 0 {
				_ = w32.DeleteObject(w32.HGDIOBJ(self.hFont))
				self.hFont = 0
				self.hFontOwned = false
			}
		}
	}
	return w32.DefWindowProc(hwnd, msg, wParam, lParam)
}

func (m *windowsTextInputDialog) show() (chan string, error) {
	m.result = make(chan string, 1)
	defer runtime.KeepAlive(m)

	// Resolve parent window
	if m.dialog.Window != nil {
		if native := m.dialog.Window.NativeWindow(); native != nil {
			m.parent = w32.HWND(uintptr(native))
		}
	}

	// If we have a parent, disable it to simulate modality
	if m.parent != 0 && w32.IsWindowEnabled(m.parent) {
		w32.EnableWindow(m.parent, false)
		defer w32.EnableWindow(m.parent, true)
	}

	// Register class once
	if _, err := w32.RegisterWindow(winTextDlgClass, textInputDlgWndProc); err != nil {
		return nil, fmt.Errorf("register text input dialog: %w", err)
	}

	// Use DPI scaling
	dpi := uint(96)
	if w32.HasGetDpiForWindowFunc() && m.parent != 0 {
		// Use parent window DPI if available before creating our own hwnd
		dpi = w32.GetDpiForWindow(m.parent)
	}
	scale := func(v int) int { return int(math.Round(float64(v) * float64(dpi) / 96.0)) }

	// Layout constants (client area)
	pad := scale(12)
	clientW := scale(420)
	btnH := scale(28)
	editH := scale(24)
	msg := strings.TrimSpace(m.dialog.Message)

	// Determine window size from desired client size (estimate message height for initial size)
	estMsgH := 0
	if msg != "" {
		estMsgH = scale(32)
	}
	desiredClientH := pad + estMsgH + scale(8) + editH + scale(16) + btnH + pad

	// Determine window size from desired client size
	style := uint(w32.WS_CAPTION | w32.WS_SYSMENU | w32.WS_POPUP)
	exStyle := uint(w32.WS_EX_DLGMODALFRAME | w32.WS_EX_CONTROLPARENT)
	rect := w32.RECT{Left: 0, Top: 0, Right: int32(clientW), Bottom: int32(desiredClientH)}
	w32.AdjustWindowRectEx(&rect, style, false, exStyle)
	winW := int(rect.Right - rect.Left)
	winH := int(rect.Bottom - rect.Top)

	// Create the window (owned by parent if present) and pass self via lpParam
	title := m.dialog.Title
	if strings.TrimSpace(title) == "" {
		title = defaultTitles[QuestionDialogType]
	}

	m.hwnd = w32.CreateWindowEx(
		exStyle,
		w32.MustStringToUTF16Ptr(winTextDlgClass),
		w32.MustStringToUTF16Ptr(title),
		style,
		w32.CW_USEDEFAULT, w32.CW_USEDEFAULT, winW, winH,
		m.parent, 0, w32.GetModuleHandle(""), unsafe.Pointer(m),
	)
	if m.hwnd == 0 {
		return nil, fmt.Errorf("unable to create text input dialog")
	}

	// Recompute scale with actual window DPI if available
	if w32.HasGetDpiForWindowFunc() {
		dpi = w32.GetDpiForWindow(m.hwnd)
		scale = func(v int) int { return int(math.Round(float64(v) * float64(dpi) / 96.0)) }
		// recompute pixel constants for child layout
		pad = scale(12)
		btnH = scale(28)
		editH = scale(24)
		clientW = int(w32.GetClientRect(m.hwnd).Right - w32.GetClientRect(m.hwnd).Left)
	}

	// Ensure GWLP_USERDATA is bound (in case WM_CREATE was not hit)
	w32.SetWindowLongPtr(m.hwnd, w32.GWLP_USERDATA, uintptr(unsafe.Pointer(m)))

	// Optional icon
	if m.dialog.Icon != nil && len(m.dialog.Icon) > 0 {
		if h, err := w32.CreateSmallHIconFromImage(m.dialog.Icon); err == nil && h != 0 {
			m.icon = h
			w32.SendMessage(m.hwnd, wmSetIcon, iconSmall, uintptr(h))
			w32.SendMessage(m.hwnd, wmSetIcon, iconBig, uintptr(h))
		}
	} else if globalApplication != nil && globalApplication.options.Icon != nil {
		if h, err := w32.CreateSmallHIconFromImage(globalApplication.options.Icon); err == nil && h != 0 {
			m.icon = h
			w32.SendMessage(m.hwnd, wmSetIcon, iconSmall, uintptr(h))
			w32.SendMessage(m.hwnd, wmSetIcon, iconBig, uintptr(h))
		}
	}

	// Calculate client rect for positioning
	clientRect := w32.GetClientRect(m.hwnd)
	cw := int(clientRect.Right - clientRect.Left)

	// Use the current Windows message font for native look
	m.hFont, m.hFontOwned = w32.GetDefaultMessageFont()

	// Layout positions within client area
	y := pad
	if msg != "" {
		// Measure text height using DrawText with word-wrap
		dc := w32.GetDC(m.hwnd)
		if dc != 0 {
			if m.hFont != 0 {
				_ = w32.SelectObject(dc, w32.HGDIOBJ(m.hFont))
			}
			// Prepare rect for calculation
			r := w32.RECT{Left: int32(pad), Top: int32(y), Right: int32(cw - pad), Bottom: int32(y)}
			text := w32.MustStringToUTF16(msg)
			_ = w32.DrawText(dc, text, len(text), &r, w32.DT_CALCRECT|w32.DT_WORDBREAK)
			msgH := int(r.Bottom - r.Top)
			// Create static with measured height; use SS_EDITCONTROL to enable wrapping
			m.label = w32.CreateWindowEx(
				0,
				w32.MustStringToUTF16Ptr("STATIC"),
				w32.MustStringToUTF16Ptr(msg),
				w32.WS_CHILD|w32.WS_VISIBLE|w32.SS_LEFT|w32.SS_EDITCONTROL,
				pad, y, cw-pad*2, msgH,
				m.hwnd, 0, w32.GetModuleHandle(""), nil,
			)
			setFontIf(m.label, m.hFont)
			y += msgH + scale(8)
			w32.ReleaseDC(m.hwnd, dc)
		}
	}

	m.edit = w32.CreateWindowEx(
		w32.WS_EX_CLIENTEDGE,
		w32.MustStringToUTF16Ptr("EDIT"),
		w32.MustStringToUTF16Ptr(m.dialog.DefaultText),
		uint(w32.WS_CHILD|w32.WS_VISIBLE|w32.WS_TABSTOP|w32.ES_AUTOHSCROLL)|func() uint {
			if m.dialog.Password {
				return uint(w32.ES_PASSWORD)
			}
			return 0
		}(),
		pad, y, cw-pad*2, editH,
		m.hwnd, w32.HMENU(ctrlIDEdit), w32.GetModuleHandle(""), nil,
	)
	setFontIf(m.edit, m.hFont)

	// Placeholder
	if ph := strings.TrimSpace(m.dialog.Placeholder); ph != "" {
		w32.SendMessage(m.edit, w32.EM_SETCUEBANNER, 0, uintptr(unsafe.Pointer(w32.MustStringToUTF16Ptr(ph))))
	}
	// Select all default text and focus
	w32.SendMessage(m.edit, w32.EM_SETSEL, 0, ^uintptr(0))

	// Buttons at bottom-right
	btnY := int(clientRect.Bottom-clientRect.Top) - pad - btnH
	okText := strings.TrimSpace(m.dialog.OKButtonText)
	if okText == "" {
		okText = "OK"
	}
	cancelText := strings.TrimSpace(m.dialog.CancelButtonText)
	if cancelText == "" {
		cancelText = "Cancel"
	}

	m.okBtn = w32.CreateWindowEx(
		0,
		w32.MustStringToUTF16Ptr("BUTTON"),
		w32.MustStringToUTF16Ptr(okText),
		w32.WS_CHILD|w32.WS_VISIBLE|w32.WS_TABSTOP|w32.BS_DEFPUSHBUTTON,
		cw-pad*2-scale(90*2+8), btnY, scale(90), btnH,
		m.hwnd, w32.HMENU(w32.IDOK), w32.GetModuleHandle(""), nil,
	)
	setFontIf(m.okBtn, m.hFont)

	m.cancelBtn = w32.CreateWindowEx(
		0,
		w32.MustStringToUTF16Ptr("BUTTON"),
		w32.MustStringToUTF16Ptr(cancelText),
		w32.WS_CHILD|w32.WS_VISIBLE|w32.WS_TABSTOP|w32.BS_PUSHBUTTON,
		cw-pad-scale(90), btnY, scale(90), btnH,
		m.hwnd, w32.HMENU(w32.IDCANCEL), w32.GetModuleHandle(""), nil,
	)
	setFontIf(m.cancelBtn, m.hFont)

	// center relative to parent if available & show
	if m.parent != 0 {
		// center to parent
		pRect := w32.GetWindowRect(m.parent)
		wRect := w32.GetWindowRect(m.hwnd)
		pw := int(pRect.Right - pRect.Left)
		ph := int(pRect.Bottom - pRect.Top)
		ww := int(wRect.Right - wRect.Left)
		wh := int(wRect.Bottom - wRect.Top)
		x := int(pRect.Left) + (pw-ww)/2
		y2 := int(pRect.Top) + (ph-wh)/2
		w32.SetWindowPos(m.hwnd, w32.HWND_TOP, x, y2, 0, 0, w32.SWP_NOSIZE)
	} else {
		w32.CenterWindow(m.hwnd)
	}
	w32.ShowWindow(m.hwnd, w32.SW_SHOWNORMAL)
	w32.UpdateWindow(m.hwnd)
	w32.SetForegroundWindow(m.hwnd)
	w32.SetFocus(m.edit)

	// Local message loop until window is destroyed
	for {
		if !w32.IsWindow(m.hwnd) {
			break
		}
		var msg w32.MSG
		ret := w32.GetMessage(&msg, 0, 0, 0)
		if int32(ret) <= 0 {
			w32.DestroyWindow(m.hwnd)
			if !m.finishedOnce {
				m.finishedOnce = true
				m.result <- ""
				close(m.result)
			}
			if ret == 0 {
				w32.PostQuitMessage(int(msg.WParam))
			}
			if int32(ret) < 0 {
				return nil, fmt.Errorf("text input dialog message loop failed")
			}
			break
		}
		if !w32.IsDialogMessage(m.hwnd, &msg) {
			w32.TranslateMessage(&msg)
			w32.DispatchMessage(&msg)
		}
	}

	return m.result, nil
}
