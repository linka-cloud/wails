//go:build linux && cgo && !purego && !android && !server

package application

/*
#include <gtk/gtk.h>
#include <stdint.h>

extern void linuxTextInputCallback(unsigned int id, char *text);

static void text_input_response(GtkDialog *dialog, int response, gpointer data) {
    GtkWidget *entry = g_object_get_data(G_OBJECT(dialog), "wails-text-entry");
    const char *text = "";
    if (response == GTK_RESPONSE_OK) {
#if GTK_MAJOR_VERSION >= 4
        text = gtk_editable_get_text(GTK_EDITABLE(entry));
#else
        text = gtk_entry_get_text(GTK_ENTRY(entry));
#endif
    }
    linuxTextInputCallback((unsigned int)(uintptr_t)data, (char *)text);
#if GTK_MAJOR_VERSION >= 4
    gtk_window_destroy(GTK_WINDOW(dialog));
#else
    gtk_widget_destroy(GTK_WIDGET(dialog));
#endif
}

static void text_input_append(GtkWidget *box, GtkWidget *widget) {
#if GTK_MAJOR_VERSION >= 4
    gtk_box_append(GTK_BOX(box), widget);
#else
    gtk_container_add(GTK_CONTAINER(box), widget);
#endif
}

static void show_text_input(unsigned int id, GtkWindow *parent,
    char *title, char *message, char *text, char *placeholder, int password,
    char *ok, char *cancel, void *icon, size_t icon_length) {
    GtkWidget *dialog = gtk_dialog_new();
    gtk_window_set_title(GTK_WINDOW(dialog), title);
    gtk_window_set_modal(GTK_WINDOW(dialog), TRUE);
    gtk_window_set_default_size(GTK_WINDOW(dialog), 420, -1);
    if (parent) gtk_window_set_transient_for(GTK_WINDOW(dialog), parent);
    GtkWidget *box = gtk_dialog_get_content_area(GTK_DIALOG(dialog));
    gtk_widget_set_margin_top(box, 12);
    gtk_widget_set_margin_bottom(box, 12);
    gtk_widget_set_margin_start(box, 12);
    gtk_widget_set_margin_end(box, 12);
    gtk_box_set_spacing(GTK_BOX(box), 8);
    if (icon && icon_length) {
        GBytes *bytes = g_bytes_new(icon, icon_length);
#if GTK_MAJOR_VERSION >= 4
        GdkTexture *texture = gdk_texture_new_from_bytes(bytes, NULL);
        if (texture) {
            GtkWidget *image = gtk_image_new_from_paintable(GDK_PAINTABLE(texture));
            text_input_append(box, image);
            g_object_unref(texture);
        }
#else
        GInputStream *stream = g_memory_input_stream_new_from_bytes(bytes);
        GdkPixbuf *pixbuf = gdk_pixbuf_new_from_stream(stream, NULL, NULL);
        if (pixbuf) {
            text_input_append(box, gtk_image_new_from_pixbuf(pixbuf));
            g_object_unref(pixbuf);
        }
        g_object_unref(stream);
#endif
        g_bytes_unref(bytes);
    }
    GtkWidget *label = gtk_label_new(message);
    #if GTK_MAJOR_VERSION >= 4
    gtk_label_set_wrap(GTK_LABEL(label), TRUE);
#else
    gtk_label_set_line_wrap(GTK_LABEL(label), TRUE);
#endif
    text_input_append(box, label);
    GtkWidget *entry = gtk_entry_new();
#if GTK_MAJOR_VERSION >= 4
    gtk_editable_set_text(GTK_EDITABLE(entry), text);
#else
    gtk_entry_set_text(GTK_ENTRY(entry), text);
#endif
    gtk_entry_set_placeholder_text(GTK_ENTRY(entry), placeholder);
    gtk_entry_set_visibility(GTK_ENTRY(entry), !password);
    if (password) gtk_entry_set_input_purpose(GTK_ENTRY(entry), GTK_INPUT_PURPOSE_PASSWORD);
    gtk_entry_set_activates_default(GTK_ENTRY(entry), TRUE);
    text_input_append(box, entry);
    gtk_dialog_add_button(GTK_DIALOG(dialog), cancel, GTK_RESPONSE_CANCEL);
    gtk_dialog_add_button(GTK_DIALOG(dialog), ok, GTK_RESPONSE_OK);
    gtk_dialog_set_default_response(GTK_DIALOG(dialog), GTK_RESPONSE_OK);
    g_object_set_data(G_OBJECT(dialog), "wails-text-entry", entry);
    g_signal_connect(dialog, "response", G_CALLBACK(text_input_response), (gpointer)(uintptr_t)id);
#if GTK_MAJOR_VERSION >= 4
    gtk_window_present(GTK_WINDOW(dialog));
#else
    gtk_widget_show_all(dialog);
#endif
    gtk_widget_grab_focus(entry);
}
*/
import "C"

import (
	"sync"
	"unsafe"
)

var linuxTextInputResponses sync.Map

func runTextInputDialogChan(d *TextInputDialogStruct) (chan string, error) {
	result := make(chan string, 1)
	id := getDialogID()
	linuxTextInputResponses.Store(id, result)
	var parent unsafe.Pointer
	if d.Window != nil {
		parent = d.Window.NativeWindow()
	}
	ok, cancel := textInputButtonLabels(d)
	values := []string{d.Title, d.Message, d.DefaultText, d.Placeholder, ok, cancel}
	args := make([]*C.char, len(values))
	for i, value := range values {
		args[i] = C.CString(value)
		defer C.free(unsafe.Pointer(args[i]))
	}
	password := C.int(0)
	if d.Password {
		password = 1
	}
	var icon unsafe.Pointer
	if len(d.Icon) > 0 {
		icon = unsafe.Pointer(&d.Icon[0])
	}
	C.show_text_input(C.uint(id), (*C.GtkWindow)(parent), args[0], args[1], args[2], args[3], password, args[4], args[5], icon, C.size_t(len(d.Icon)))
	return result, nil
}

//export linuxTextInputCallback
func linuxTextInputCallback(id C.uint, text *C.char) {
	if value, ok := linuxTextInputResponses.LoadAndDelete(uint(id)); ok {
		result := value.(chan string)
		result <- C.GoString(text)
		close(result)
		freeDialogID(uint(id))
	}
}
