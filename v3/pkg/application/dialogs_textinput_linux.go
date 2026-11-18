//go:build linux && !android && !server

package application

type linuxTextInputDialog struct{ dialog *TextInputDialogStruct }

func newTextInputDialogImpl(d *TextInputDialogStruct) *linuxTextInputDialog {
	return &linuxTextInputDialog{dialog: d}
}

func (m *linuxTextInputDialog) show() (chan string, error) {
	return runTextInputDialogChan(m.dialog)
}
