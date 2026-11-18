package application

import "strings"

// Text Input Dialog API

type textInputDialogImpl interface {
	show() (chan string, error)
}

type TextInputDialogOptions struct {
	Title            string
	Message          string
	DefaultText      string
	Placeholder      string
	Password         bool
	OKButtonText     string
	CancelButtonText string
	Icon             []byte
	Window           Window
}

type TextInputDialogStruct struct {
	TextInputDialogOptions
	impl textInputDialogImpl
}

func TextInputDialog() *TextInputDialogStruct { return newTextInputDialog() }

func newTextInputDialog() *TextInputDialogStruct {
	return &TextInputDialogStruct{
		TextInputDialogOptions: TextInputDialogOptions{
			OKButtonText:     "OK",
			CancelButtonText: "Cancel",
		},
	}
}

func (d *TextInputDialogStruct) SetTitle(title string) *TextInputDialogStruct {
	d.Title = title
	return d
}
func (d *TextInputDialogStruct) SetMessage(message string) *TextInputDialogStruct {
	d.Message = message
	return d
}
func (d *TextInputDialogStruct) SetDefaultText(text string) *TextInputDialogStruct {
	d.DefaultText = text
	return d
}
func (d *TextInputDialogStruct) SetPlaceholder(text string) *TextInputDialogStruct {
	d.Placeholder = text
	return d
}
func (d *TextInputDialogStruct) SetPassword(password bool) *TextInputDialogStruct {
	d.Password = password
	return d
}
func (d *TextInputDialogStruct) SetOKButtonText(text string) *TextInputDialogStruct {
	d.OKButtonText = strings.TrimSpace(text)
	return d
}
func (d *TextInputDialogStruct) SetCancelButtonText(text string) *TextInputDialogStruct {
	d.CancelButtonText = strings.TrimSpace(text)
	return d
}
func (d *TextInputDialogStruct) SetIcon(icon []byte) *TextInputDialogStruct {
	d.Icon = icon
	return d
}
func (d *TextInputDialogStruct) AttachToWindow(window Window) *TextInputDialogStruct {
	d.Window = window
	return d
}

// PromptForText shows the dialog and returns the entered text.
// If the user cancels the dialog, an empty string is returned.
func (d *TextInputDialogStruct) PromptForText() (string, error) {
	if !dialogsCanBeShown("TextInputDialog.PromptForText") {
		return "", nil
	}
	// A fresh implementation allows a dialog builder to be shown again.
	d.impl = newTextInputDialogImpl(d)
	results, err := InvokeSyncWithResultAndError(d.impl.show)
	if err != nil {
		return "", err
	}
	var result string
	if results != nil {
		result = <-results
	}
	return result, nil
}

func textInputButtonLabels(d *TextInputDialogStruct) (string, string) {
	ok, cancel := strings.TrimSpace(d.OKButtonText), strings.TrimSpace(d.CancelButtonText)
	if ok == "" {
		ok = "OK"
	}
	if cancel == "" {
		cancel = "Cancel"
	}
	return ok, cancel
}
