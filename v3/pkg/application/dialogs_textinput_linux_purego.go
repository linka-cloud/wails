//go:build linux && purego && !android && !server

package application

import (
	"fmt"
	"runtime"
	"sync"
	"unsafe"

	"github.com/ebitengine/purego"
)

// These additional dialog bindings are shared by the GTK3 and GTK4 purego
// backends. Bind once, and use a single callback slot for all dialog instances.
var textInputGTK struct {
	once                                            sync.Once
	err                                             error
	newDialog                                       func() uintptr
	content                                         func(uintptr) uintptr
	title                                           func(uintptr, string)
	modal                                           func(uintptr, int32)
	size                                            func(uintptr, int32, int32)
	parent                                          func(uintptr, uintptr)
	marginTop, marginBottom, marginStart, marginEnd func(uintptr, int32)
	spacing                                         func(uintptr, int32)
	label                                           func(string) uintptr
	wrap                                            func(uintptr, int32)
	entry                                           func() uintptr
	setText                                         func(uintptr, string)
	getText                                         func(uintptr) string
	placeholder                                     func(uintptr, string)
	visibility, purpose, activates                  func(uintptr, int32)
	append                                          func(uintptr, uintptr)
	button                                          func(uintptr, string, int32) uintptr
	defaultResponse                                 func(uintptr, int32)
	connect                                         func(uintptr, string, uintptr, uintptr, uintptr, uint32) uint64
	present, destroy                                func(uintptr)
	focus                                           func(uintptr) int32
	bytes                                           func(unsafe.Pointer, uintptr) uintptr
	bytesUnref, unref                               func(uintptr)
	texture                                         func(uintptr, uintptr) uintptr
	stream                                          func(uintptr) uintptr
	pixbuf                                          func(uintptr, uintptr, uintptr) uintptr
	image                                           func(uintptr) uintptr
}

var textInputGTKResponses sync.Map

type textInputGTKResponse struct {
	entry  uintptr
	result chan string
}

var textInputGTKCallback = purego.NewCallback(func(dialog uintptr, response int32, _ uintptr) {
	value, ok := textInputGTKResponses.LoadAndDelete(dialog)
	if !ok {
		return
	}
	pending := value.(textInputGTKResponse)
	text := ""
	if response == -5 {
		text = textInputGTK.getText(pending.entry)
	} // GTK_RESPONSE_OK
	pending.result <- text
	close(pending.result)
	textInputGTK.destroy(dialog)
})

func loadTextInputGTK() {
	lib, err := purego.Dlopen(textInputGTKLibrary, purego.RTLD_NOW|purego.RTLD_GLOBAL)
	if err != nil {
		textInputGTK.err = err
		return
	}
	symbols := map[string]any{
		"gtk_dialog_new":                  &textInputGTK.newDialog,
		"gtk_dialog_get_content_area":     &textInputGTK.content,
		"gtk_window_set_title":            &textInputGTK.title,
		"gtk_window_set_modal":            &textInputGTK.modal,
		"gtk_window_set_default_size":     &textInputGTK.size,
		"gtk_window_set_transient_for":    &textInputGTK.parent,
		"gtk_widget_set_margin_top":       &textInputGTK.marginTop,
		"gtk_widget_set_margin_bottom":    &textInputGTK.marginBottom,
		"gtk_widget_set_margin_start":     &textInputGTK.marginStart,
		"gtk_widget_set_margin_end":       &textInputGTK.marginEnd,
		"gtk_box_set_spacing":             &textInputGTK.spacing,
		"gtk_label_new":                   &textInputGTK.label,
		"gtk_entry_new":                   &textInputGTK.entry,
		"gtk_entry_set_placeholder_text":  &textInputGTK.placeholder,
		"gtk_entry_set_visibility":        &textInputGTK.visibility,
		"gtk_entry_set_input_purpose":     &textInputGTK.purpose,
		"gtk_entry_set_activates_default": &textInputGTK.activates,
		"gtk_dialog_add_button":           &textInputGTK.button,
		"gtk_dialog_set_default_response": &textInputGTK.defaultResponse,
		"g_signal_connect_data":           &textInputGTK.connect,
		"gtk_widget_grab_focus":           &textInputGTK.focus,
		"g_bytes_new":                     &textInputGTK.bytes,
		"g_bytes_unref":                   &textInputGTK.bytesUnref,
		"g_object_unref":                  &textInputGTK.unref,
	}
	if textInputGTK3 {
		symbols["gtk_label_set_line_wrap"] = &textInputGTK.wrap
		symbols["gtk_entry_set_text"] = &textInputGTK.setText
		symbols["gtk_entry_get_text"] = &textInputGTK.getText
		symbols["gtk_container_add"] = &textInputGTK.append
		symbols["gtk_widget_show_all"] = &textInputGTK.present
		symbols["gtk_widget_destroy"] = &textInputGTK.destroy
		symbols["g_memory_input_stream_new_from_bytes"] = &textInputGTK.stream
		symbols["gdk_pixbuf_new_from_stream"] = &textInputGTK.pixbuf
		symbols["gtk_image_new_from_pixbuf"] = &textInputGTK.image
	} else {
		symbols["gtk_label_set_wrap"] = &textInputGTK.wrap
		symbols["gtk_editable_set_text"] = &textInputGTK.setText
		symbols["gtk_editable_get_text"] = &textInputGTK.getText
		symbols["gtk_box_append"] = &textInputGTK.append
		symbols["gtk_window_present"] = &textInputGTK.present
		symbols["gtk_window_destroy"] = &textInputGTK.destroy
		symbols["gdk_texture_new_from_bytes"] = &textInputGTK.texture
		symbols["gtk_image_new_from_paintable"] = &textInputGTK.image
	}
	for name, target := range symbols {
		symbol, err := purego.Dlsym(lib, name)
		if err != nil {
			textInputGTK.err = fmt.Errorf("text input dialog: %s: %w", name, err)
			return
		}
		purego.RegisterFunc(target, symbol)
	}
}

func runTextInputDialogChan(d *TextInputDialogStruct) (chan string, error) {
	textInputGTK.once.Do(loadTextInputGTK)
	if textInputGTK.err != nil {
		return nil, textInputGTK.err
	}
	f := &textInputGTK
	result := make(chan string, 1)
	dialog := f.newDialog()
	f.title(dialog, d.Title)
	f.modal(dialog, 1)
	f.size(dialog, 420, -1)
	if d.Window != nil {
		if parent := d.Window.NativeWindow(); parent != nil {
			f.parent(dialog, uintptr(parent))
		}
	}
	box := f.content(dialog)
	f.marginTop(box, 12)
	f.marginBottom(box, 12)
	f.marginStart(box, 12)
	f.marginEnd(box, 12)
	f.spacing(box, 8)
	if len(d.Icon) > 0 {
		bytes := f.bytes(unsafe.Pointer(&d.Icon[0]), uintptr(len(d.Icon)))
		runtime.KeepAlive(d.Icon)
		var image uintptr
		if textInputGTK3 {
			stream := f.stream(bytes)
			pixbuf := f.pixbuf(stream, 0, 0)
			if pixbuf != 0 {
				image = f.image(pixbuf)
				f.unref(pixbuf)
			}
			f.unref(stream)
		} else {
			texture := f.texture(bytes, 0)
			if texture != 0 {
				image = f.image(texture)
				f.unref(texture)
			}
		}
		f.bytesUnref(bytes)
		if image != 0 {
			f.append(box, image)
		}
	}
	label := f.label(d.Message)
	f.wrap(label, 1)
	f.append(box, label)
	entry := f.entry()
	f.setText(entry, d.DefaultText)
	f.placeholder(entry, d.Placeholder)
	if d.Password {
		f.visibility(entry, 0)
		f.purpose(entry, 8)
	} else {
		f.visibility(entry, 1)
	}
	f.activates(entry, 1)
	f.append(box, entry)
	ok, cancel := textInputButtonLabels(d)
	f.button(dialog, cancel, -6) // GTK_RESPONSE_CANCEL
	f.button(dialog, ok, -5)
	f.defaultResponse(dialog, -5)
	textInputGTKResponses.Store(dialog, textInputGTKResponse{entry: entry, result: result})
	f.connect(dialog, "response", textInputGTKCallback, 0, 0, 0)
	f.present(dialog)
	f.focus(entry)
	return result, nil
}
