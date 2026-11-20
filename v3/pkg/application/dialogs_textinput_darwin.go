//go:build darwin && !ios && !server && !purego

package application

/*
#cgo CFLAGS: -mmacosx-version-min=10.13 -x objective-c
#cgo LDFLAGS: -framework Cocoa
#import <Cocoa/Cocoa.h>
extern void textInputDialogCallback(unsigned int id, char* text);
// Show a text input dialog with optional secure entry and placeholder
static void showTextInputDialog(
	unsigned int dialogID,
	char* title,
	char* message,
	char* defaultText,
	char* placeholder,
	bool password,
	char* okButtonText,
	char* cancelButtonText,
	void *window,
	void *icon,
	int length
) {
	NSAlert *alert = [[NSAlert alloc] init];
	[alert setAlertStyle:NSAlertStyleInformational];

	if (icon != NULL) {
		NSImage *image = [[NSImage alloc] initWithData:[NSData dataWithBytes:icon length:length]];
		[alert setIcon:image];
        [image release];
	} else if (password) {
		NSImage *image = [NSImage imageNamed:NSImageNameLockLockedTemplate];
		[alert setIcon:image];
	} else {
		NSImage *image = [NSImage imageNamed:NSImageNameInfo];
		[alert setIcon:image];
	}

	if (title != NULL) {
		[alert setMessageText:[NSString stringWithUTF8String:title]];
		free(title);
	}
	if (message != NULL) {
		[alert setInformativeText:[NSString stringWithUTF8String:message]];
		free(message);
	}

	NSTextField *textField;
	if (password) {
		textField = [NSSecureTextField new];
	} else {
		textField = [NSTextField new];
	}
	NSControlSize controlSize = NSControlSizeRegular;
	if (@available(macOS 11.0, *)) {
		controlSize = NSControlSizeLarge;
	}
	[textField setBezeled:YES];
	[textField setBezelStyle:NSTextFieldRoundedBezel];
	[textField setControlSize:controlSize];
	[textField setFont:[NSFont systemFontOfSize:[NSFont systemFontSizeForControlSize:controlSize]]];
	[textField setUsesSingleLineMode:YES];
	[[textField cell] setScrollable:YES];
	CGFloat height = MAX(24.0, ceil([textField fittingSize].height));
	// Let the alert choose its width from the message and buttons.
	[textField setFrame:NSMakeRect(0, 0, 1, height)];
	if (defaultText != NULL) {
		[textField setStringValue:[NSString stringWithUTF8String:defaultText]];
		free(defaultText);
	}
	if (placeholder != NULL) {
		[textField setPlaceholderString:[NSString stringWithUTF8String:placeholder]];
		free(placeholder);
	}
	[alert setAccessoryView:textField];
	[textField release];

	NSString *okTitle = okButtonText != NULL ? [NSString stringWithUTF8String:okButtonText] : @"OK";
	NSString *cancelTitle = cancelButtonText != NULL ? [NSString stringWithUTF8String:cancelButtonText] : @"Cancel";
	if (okButtonText != NULL) free(okButtonText);
	if (cancelButtonText != NULL) free(cancelButtonText);
	NSButton *okButton = [alert addButtonWithTitle:okTitle];
	NSButton *cancelButton = [alert addButtonWithTitle:cancelTitle];
	[okButton setKeyEquivalent:@"\r"];
	[cancelButton setKeyEquivalent:@"\033"];

	// Use the buttons' alignment rects to exclude padding around their bezels.
	[alert layout];
	NSRect okRect = [[okButton superview] convertRect:[okButton alignmentRectForFrame:[okButton frame]] toView:nil];
	NSRect cancelRect = [[cancelButton superview] convertRect:[cancelButton alignmentRectForFrame:[cancelButton frame]] toView:nil];
	NSRect buttons = NSUnionRect(okRect, cancelRect);
	[textField setFrameSize:NSMakeSize(buttons.size.width, height)];
	[alert layout];
	NSWindow *alertWindow = [alert window];
	[alertWindow setInitialFirstResponder:textField];
	[alertWindow makeFirstResponder:textField];

	// AppKit can reset the responder when the window first becomes key.
	NSNotificationCenter *notifications = [NSNotificationCenter defaultCenter];
	__block BOOL needsFocus = YES;
	id observer = [notifications addObserverForName:NSWindowDidBecomeKeyNotification
		object:alertWindow queue:nil usingBlock:^(NSNotification *notification) {
			if (needsFocus) {
				needsFocus = NO;
				[alertWindow makeFirstResponder:textField];
			}
		}];

	void (^handler)(NSModalResponse) = ^(NSModalResponse response) {
		[notifications removeObserver:observer];
		if (response == NSAlertFirstButtonReturn) {
			NSString *value = [textField stringValue];
			textInputDialogCallback(dialogID, (char*)[value UTF8String]);
		} else {
			textInputDialogCallback(dialogID, NULL);
		}
		[alert release];
	};

	if (![NSApp isActive]) {
		[NSApp activateIgnoringOtherApps:YES];
	}
	if (window != NULL) {
		[alert beginSheetModalForWindow:(__bridge NSWindow *)window completionHandler:handler];
	} else {
		NSModalResponse response = [alert runModal];
		handler(response);
	}
}

*/
import "C"
import (
	"sync"
	"unsafe"
)

var textInputResponses sync.Map

// macOS Text Input Dialog implementation

type macosTextInputDialog struct {
	dialog *TextInputDialogStruct
}

func newTextInputDialogImpl(d *TextInputDialogStruct) *macosTextInputDialog {
	return &macosTextInputDialog{dialog: d}
}

func (m *macosTextInputDialog) show() (chan string, error) {
	dialogID := getDialogID()
	result := make(chan string, 1)
	textInputResponses.Store(dialogID, result)
	var nsWindow unsafe.Pointer
	if m.dialog.Window != nil {
		nsWindow = m.dialog.Window.NativeWindow()
	}
	var iconData unsafe.Pointer
	var iconLength C.int
	if len(m.dialog.Icon) > 0 {
		iconData = unsafe.Pointer(&m.dialog.Icon[0])
		iconLength = C.int(len(m.dialog.Icon))
	} else if len(globalApplication.options.Icon) > 0 {
		iconData = unsafe.Pointer(&globalApplication.options.Icon[0])
		iconLength = C.int(len(globalApplication.options.Icon))
	}
	ok, cancel := textInputButtonLabels(m.dialog)
	C.showTextInputDialog(
		C.uint(dialogID),
		toCString(m.dialog.Title),
		toCString(m.dialog.Message),
		toCString(m.dialog.DefaultText),
		toCString(m.dialog.Placeholder),
		C.bool(m.dialog.Password),
		toCString(ok),
		toCString(cancel),
		nsWindow,
		iconData,
		iconLength,
	)
	return result, nil
}

//export textInputDialogCallback
func textInputDialogCallback(cid C.uint, ctext *C.char) {
	dialogID := uint(cid)
	if value, ok := textInputResponses.LoadAndDelete(dialogID); ok {
		result := value.(chan string)
		text := ""
		if ctext != nil {
			text = C.GoString(ctext)
		}
		result <- text
		close(result)
		freeDialogID(dialogID)
	}
}
