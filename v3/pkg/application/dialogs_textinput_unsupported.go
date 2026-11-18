//go:build server || android || ios

package application

import "errors"

type unsupportedTextInputDialog struct{}

func newTextInputDialogImpl(*TextInputDialogStruct) textInputDialogImpl {
	return &unsupportedTextInputDialog{}
}
func (*unsupportedTextInputDialog) show() (chan string, error) {
	return nil, errors.New("text input dialogs are not available on this platform")
}
