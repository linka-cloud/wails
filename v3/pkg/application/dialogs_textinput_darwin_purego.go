//go:build darwin && purego && !ios && !server

package application

import "github.com/ebitengine/purego/objc"

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
	field := class(fieldClass).send("alloc").send("initWithFrame:", rect(0, 0, 226, 24))
	field.send("setStringValue:", nsString(d.DefaultText))
	field.send("setPlaceholderString:", nsString(d.Placeholder))
	alert.send("setAccessoryView:", field)
	field.send("release")
	ok, cancel := textInputButtonLabels(d)
	alert.send("addButtonWithTitle:", nsString(ok)).send("setKeyEquivalent:", nsString("\r"))
	alert.send("addButtonWithTitle:", nsString(cancel)).send("setKeyEquivalent:", nsString("\x1b"))

	// Layout installs the accessory view before the window can focus it.
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
