//go:build windows
// +build windows

package application

import (
	"math"
	"path/filepath"
	"strings"
	"unsafe"

	"golang.org/x/sys/windows"

	"github.com/wailsapp/wails/v3/internal/go-common-file-dialog/cfd"
	"github.com/wailsapp/wails/v3/pkg/w32"
)

func (m *windowsApp) showAboutDialog(title string, message string, _ []byte) {
	about := newDialogImpl(&MessageDialog{
		MessageDialogOptions: MessageDialogOptions{
			DialogType: InfoDialogType,
			Title:      title,
			Message:    message,
		},
	})
	about.UseAppIcon = true
	about.show()
}

type windowsDialog struct {
	dialog *MessageDialog

	// dialogImpl unsafe.Pointer
	UseAppIcon bool
}

func (m *windowsDialog) show() {

	title := w32.MustStringToUTF16Ptr(m.dialog.Title)
	message := w32.MustStringToUTF16Ptr(m.dialog.Message)
	flags := calculateMessageDialogFlags(m.dialog.MessageDialogOptions)
	var button int32
	var err error

	var parentWindow uintptr
	if m.dialog.window != nil {
		nativeWindow := m.dialog.window.NativeWindow()
		if nativeWindow != nil {
			parentWindow = uintptr(nativeWindow)
		}
	}

	if m.UseAppIcon || m.dialog.Icon != nil {
		// 3 is the application icon
		button, err = w32.MessageBoxWithIcon(parentWindow, message, title, 3, windows.MB_OK|windows.MB_USERICON)
		if err != nil {
			globalApplication.handleFatalError(err)
		}
	} else {
		button, err = windows.MessageBox(windows.HWND(parentWindow), message, title, flags|windows.MB_SYSTEMMODAL)
		if err != nil {
			globalApplication.handleFatalError(err)
		}
	}
	// This maps MessageBox return values to strings
	responses := []string{"", "Ok", "Cancel", "Abort", "Retry", "Ignore", "Yes", "No", "", "", "Try Again", "Continue"}
	result := "Error"
	if int(button) < len(responses) {
		result = responses[button]
	}
	// Check if there's a callback for the button pressed
	for _, buttonInDialog := range m.dialog.Buttons {
		if buttonInDialog.Label == result {
			if buttonInDialog.Callback != nil {
				buttonInDialog.Callback()
			}
		}
	}
}

func newDialogImpl(d *MessageDialog) *windowsDialog {
	return &windowsDialog{
		dialog: d,
	}
}

type windowOpenFileDialog struct {
	dialog *OpenFileDialogStruct
}

func newOpenFileDialogImpl(d *OpenFileDialogStruct) *windowOpenFileDialog {
	return &windowOpenFileDialog{
		dialog: d,
	}
}

func getDefaultFolder(folder string) (string, error) {
	if folder == "" {
		return "", nil
	}
	return filepath.Abs(folder)
}

func (m *windowOpenFileDialog) show() (chan string, error) {

	defaultFolder, err := getDefaultFolder(m.dialog.directory)
	if err != nil {
		return nil, err
	}

	config := cfd.DialogConfig{
		Title:       m.dialog.title,
		Role:        "PickFolder",
		FileFilters: convertFilters(m.dialog.filters),
		Folder:      defaultFolder,
	}

	var result []string
	if m.dialog.allowsMultipleSelection && !m.dialog.canChooseDirectories {
		temp, err := showCfdDialog(
			func() (cfd.Dialog, error) {
				return cfd.NewOpenMultipleFilesDialog(config)
			}, true, m.dialog.window)
		if err != nil {
			return nil, err
		}
		result = temp.([]string)
	} else {
		if m.dialog.canChooseDirectories {
			temp, err := showCfdDialog(
				func() (cfd.Dialog, error) {
					return cfd.NewSelectFolderDialog(config)
				}, false, m.dialog.window)
			if err != nil {
				return nil, err
			}
			result = []string{temp.(string)}
		} else {
			temp, err := showCfdDialog(
				func() (cfd.Dialog, error) {
					return cfd.NewOpenFileDialog(config)
				}, false, m.dialog.window)
			if err != nil {
				return nil, err
			}
			result = []string{temp.(string)}
		}
	}

	files := make(chan string)
	go func() {
		defer handlePanic()
		for _, file := range result {
			files <- file
		}
		close(files)
	}()
	return files, nil
}

type windowSaveFileDialog struct {
	dialog *SaveFileDialogStruct
}

func newSaveFileDialogImpl(d *SaveFileDialogStruct) *windowSaveFileDialog {
	return &windowSaveFileDialog{
		dialog: d,
	}
}

func (m *windowSaveFileDialog) show() (chan string, error) {
	files := make(chan string)
	defaultFolder, err := getDefaultFolder(m.dialog.directory)
	if err != nil {
		close(files)
		return files, err
	}

	config := cfd.DialogConfig{
		Title:       m.dialog.title,
		Role:        "SaveFile",
		FileFilters: convertFilters(m.dialog.filters),
		FileName:    m.dialog.filename,
		Folder:      defaultFolder,
	}

	// Original PR for v2 by @almas1992: https://github.com/wailsapp/wails/pull/3205
	if len(m.dialog.filters) > 0 {
		config.DefaultExtension = strings.TrimPrefix(strings.Split(m.dialog.filters[0].Pattern, ";")[0], "*")
	}

	result, err := showCfdDialog(
		func() (cfd.Dialog, error) {
			return cfd.NewSaveFileDialog(config)
		}, false, m.dialog.window)
	if err != nil {
		close(files)
		return files, err
	}
	go func() {
		defer handlePanic()
		f, ok := result.(string)
		if ok {
			files <- f
		}
		close(files)
	}()
	return files, err
}

func calculateMessageDialogFlags(options MessageDialogOptions) uint32 {
	var flags uint32

	switch options.DialogType {
	case InfoDialogType:
		flags = windows.MB_OK | windows.MB_ICONINFORMATION
	case ErrorDialogType:
		flags = windows.MB_ICONERROR | windows.MB_OK
	case QuestionDialogType:
		flags = windows.MB_YESNO
		for _, button := range options.Buttons {
			if strings.TrimSpace(strings.ToLower(button.Label)) == "no" && button.IsDefault {
				flags |= windows.MB_DEFBUTTON2
			}
		}
	case WarningDialogType:
		flags = windows.MB_OK | windows.MB_ICONWARNING
	}

	return flags
}

func convertFilters(filters []FileFilter) []cfd.FileFilter {
	var result []cfd.FileFilter
	for _, filter := range filters {
		result = append(result, cfd.FileFilter(filter))
	}
	return result
}

func showCfdDialog(newDlg func() (cfd.Dialog, error), isMultiSelect bool, parentWindow Window) (any, error) {
	dlg, err := newDlg()
	if err != nil {
		return nil, err
	}

	// Set parent window if provided
	if parentWindow != nil {
		nativeWindow := parentWindow.NativeWindow()
		if nativeWindow != nil {
			dlg.SetParentWindowHandle(uintptr(nativeWindow))
		}
	}

	defer func() {
		err := dlg.Release()
		if err != nil {
			globalApplication.error("unable to release dialog: %w", err)
		}
	}()

	if multi, _ := dlg.(cfd.OpenMultipleFilesDialog); multi != nil && isMultiSelect {
		paths, err := multi.ShowAndGetResults()
		if err != nil {
			return nil, err
		}

		for i, path := range paths {
			paths[i] = filepath.Clean(path)
		}
		return paths, nil
	}

	path, err := dlg.ShowAndGetResult()
	if err != nil {
		return nil, err
	}
	return filepath.Clean(path), nil
}

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

// Window procedure for the dialog window
func textInputDlgWndProc(hwnd w32.HWND, msg uint32, wParam, lParam uintptr) uintptr {
	// Retrieve our instance from GWLP_USERDATA
	data := w32.GetWindowLongPtr(hwnd, w32.GWLP_USERDATA)
	var self *windowsTextInputDialog
	if data != 0 {
		self = (*windowsTextInputDialog)(unsafe.Pointer(data))
	}

	switch msg {
	case w32.WM_CREATE:
		// Set GWLP_USERDATA from lpCreateParams so it's available early
		if self == nil && lParam != 0 {
			cs := (*w32.CREATESTRUCT)(unsafe.Pointer(lParam))
			if cs != nil && cs.CreateParams != 0 {
				w32.SetWindowLongPtr(hwnd, w32.GWLP_USERDATA, cs.CreateParams)
				self = (*windowsTextInputDialog)(unsafe.Pointer(cs.CreateParams))
			}
		}
	case w32.WM_COMMAND:
		// Button clicks
		id := lowWord(wParam)
		if self != nil {
			switch id {
			case uint16(w32.IDOK):
				// Read text
				text := w32.GetWindowText(self.edit)
				if !self.finishedOnce {
					self.finishedOnce = true
					go func() {
						defer handlePanic()
						self.result <- text
						close(self.result)
					}()
				}
				w32.DestroyWindow(self.hwnd)
				return 0
			case uint16(w32.IDCANCEL):
				if !self.finishedOnce {
					self.finishedOnce = true
					go func() {
						defer handlePanic()
						self.result <- ""
						close(self.result)
					}()
				}
				w32.DestroyWindow(self.hwnd)
				return 0
			}
		}
	case w32.WM_CLOSE:
		if self != nil && !self.finishedOnce {
			self.finishedOnce = true
			go func() {
				defer handlePanic()
				self.result <- ""
				close(self.result)
			}()
		}
		w32.DestroyWindow(hwnd)
		return 0
	case w32.WM_DESTROY:
		if self != nil {
			if self.icon != 0 {
				w32.DestroyIcon(self.icon)
				self.icon = 0
			}
			if self.hFont != 0 && self.hFontOwned {
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

	// Resolve parent window
	if m.dialog.Window != nil {
		if native := m.dialog.Window.NativeWindow(); native != nil {
			m.parent = w32.HWND(uintptr(native))
		}
	}

	// If we have a parent, disable it to simulate modality
	if m.parent != 0 {
		w32.EnableWindow(m.parent, false)
		defer w32.EnableWindow(m.parent, true)
	}

	// Register class once
	_, _ = w32.RegisterWindow(winTextDlgClass, func(hwnd w32.HWND, msg uint32, wParam, lParam uintptr) uintptr {
		// Rely on IsDialogMessage to handle Enter/Esc and tab navigation
		return textInputDlgWndProc(hwnd, msg, wParam, lParam)
	})

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
		// Fallback to MessageBox on error
		_, _ = windows.MessageBox(windows.HWND(m.parent), w32.MustStringToUTF16Ptr("Unable to create input dialog"), w32.MustStringToUTF16Ptr("Error"), windows.MB_OK|windows.MB_ICONERROR)
		close(m.result)
		return m.result, nil
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
	w32.SetFocus(m.edit)

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

	// Local message loop until window is destroyed
	for {
		if !w32.IsWindow(m.hwnd) {
			break
		}
		var msg w32.MSG
		ret := w32.GetMessage(&msg, 0, 0, 0)
		if ret == 0 { // WM_QUIT posted elsewhere; exit loop
			break
		}
		if !w32.IsDialogMessage(m.hwnd, &msg) {
			w32.TranslateMessage(&msg)
			w32.DispatchMessage(&msg)
		}
	}

	return m.result, nil
}
