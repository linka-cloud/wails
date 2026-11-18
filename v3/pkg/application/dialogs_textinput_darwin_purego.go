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
	alert.send("window").send("setInitialFirstResponder:", field)
	ok, cancel := textInputButtonLabels(d)
	alert.send("addButtonWithTitle:", nsString(ok)).send("setKeyEquivalent:", nsString("\r"))
	alert.send("addButtonWithTitle:", nsString(cancel)).send("setKeyEquivalent:", nsString("\x1b"))
	finish := func(response int) {
		text := ""
		if response == nsAlertFirstButtonReturn {
			text = field.send("stringValue").string()
		}
		result <- text
		close(result)
		alert.send("release")
	}
	parent := dialogParentWindow(d.Window)
	if parent.isNil() {
		finish(get[int](alert, "runModal"))
	} else {
		block := objc.NewBlock(func(_ objc.Block, response int) { finish(response) })
		alert.send("beginSheetModalForWindow:completionHandler:", parent, block)
		block.Release()
	}
	return result, nil
}
