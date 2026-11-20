//go:build darwin && purego && !ios && !server

package application

import (
	"math"

	"github.com/ebitengine/purego/objc"
)

type macosTextInputDialog struct{ dialog *TextInputDialogStruct }

func newTextInputDialogImpl(d *TextInputDialogStruct) *macosTextInputDialog {
	return &macosTextInputDialog{dialog: d}
}

func (m *macosTextInputDialog) show() (chan string, error) {
	d := m.dialog
	result := make(chan string, 1)
	alert := class("NSAlert").send("alloc").send("init")
	alert.send("setAlertStyle:", nsAlertStyleInformational)
	alert.send("setMessageText:", nsString(d.Title))
	alert.send("setInformativeText:", nsString(d.Message))
	icon := d.Icon
	if len(icon) == 0 {
		icon = globalApplication.options.Icon
	}
	if len(icon) > 0 {
		alert.send("setIcon:", nsImageFromBytes(icon))
	}
	fieldClass := "NSTextField"
	if d.Password {
		fieldClass = "NSSecureTextField"
	}
	const (
		regularControlSize = 0
		largeControlSize   = 3
		roundedBezel       = 1
	)
	controlSize := regularControlSize
	if macOSAtLeast(11, 0) {
		controlSize = largeControlSize
	}
	// Let the alert choose its width from the message and buttons.
	field := class(fieldClass).send("alloc").send("initWithFrame:", rect(0, 0, 1, 24))
	field.send("setBezeled:", true)
	field.send("setBezelStyle:", roundedBezel)
	field.send("setControlSize:", controlSize)
	font := class("NSFont")
	fontSize := get[CGFloat](font, "systemFontSizeForControlSize:", controlSize)
	field.send("setFont:", font.send("systemFontOfSize:", fontSize))
	field.send("setUsesSingleLineMode:", true)
	field.send("cell").send("setScrollable:", true)
	height := max(24, math.Ceil(get[CGSize](field, "fittingSize").Height))
	field.send("setFrameSize:", CGSize{Width: 1, Height: height})
	field.send("setStringValue:", nsString(d.DefaultText))
	field.send("setPlaceholderString:", nsString(d.Placeholder))
	alert.send("setAccessoryView:", field)
	field.send("release")
	ok, cancel := textInputButtonLabels(d)
	okButton := alert.send("addButtonWithTitle:", nsString(ok))
	cancelButton := alert.send("addButtonWithTitle:", nsString(cancel))
	okButton.send("setKeyEquivalent:", nsString("\r"))
	cancelButton.send("setKeyEquivalent:", nsString("\x1b"))

	// Use the buttons' alignment rects to exclude padding around their bezels.
	alert.send("layout")
	alignmentRect := func(button id) CGRect {
		frame := get[CGRect](button, "frame")
		alignment := get[CGRect](button, "alignmentRectForFrame:", frame)
		return get[CGRect](button.send("superview"), "convertRect:toView:", alignment, objc.ID(0))
	}
	okBounds := alignmentRect(okButton)
	cancelBounds := alignmentRect(cancelButton)
	left := min(okBounds.Origin.X, cancelBounds.Origin.X)
	right := max(okBounds.Origin.X+okBounds.Size.Width, cancelBounds.Origin.X+cancelBounds.Size.Width)
	field.send("setFrameSize:", CGSize{Width: right - left, Height: height})
	alert.send("layout")
	alertWindow := alert.send("window")
	alertWindow.send("setInitialFirstResponder:", field)
	alertWindow.send("makeFirstResponder:", field)

	// AppKit can reset the responder when the window first becomes key.
	notifications := class("NSNotificationCenter").send("defaultCenter")
	needsFocus := true
	focusBlock := objc.NewBlock(func(_ objc.Block, _ objc.ID) {
		if needsFocus {
			needsFocus = false
			alertWindow.send("makeFirstResponder:", field)
		}
	})
	observer := notifications.send("addObserverForName:object:queue:usingBlock:",
		nsString("NSWindowDidBecomeKeyNotification"), alertWindow, objc.ID(0), focusBlock)
	focusBlock.Release()

	finish := func(response int) {
		notifications.send("removeObserver:", observer)
		text := ""
		if response == nsAlertFirstButtonReturn {
			text = field.send("stringValue").string()
		}
		result <- text
		close(result)
		alert.send("release")
	}
	parent := dialogParentWindow(d.Window)
	app := nsApp()
	if !get[bool](app, "isActive") {
		app.send("activateIgnoringOtherApps:", true)
	}
	if parent.isNil() {
		finish(get[int](alert, "runModal"))
	} else {
		block := objc.NewBlock(func(_ objc.Block, response int) { finish(response) })
		alert.send("beginSheetModalForWindow:completionHandler:", parent, block)
		block.Release()
	}
	return result, nil
}
