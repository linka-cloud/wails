//go:build darwin && purego && !ios && !server

package application

import (
	"testing"
	"time"
)

func TestHiddenSubmenuRemainsHiddenAfterRebuild(t *testing.T) {
	if !appKitReady {
		t.Skip("AppKit is unavailable")
	}
	result := make(chan string, 1)
	scheduleOnMainForTest(func() {
		menu := NewMenu()
		menu.AddSubmenu("Hidden").Add("Child")
		item := menu.items[0]
		item.SetHidden(true)
		native := createNSMenu("")
		defer native.send("release")
		defer menu.Destroy()
		impl := newMenuImpl(menu)
		for i := 0; i < 2; i++ {
			if i > 0 {
				clearNSMenu(ptrFromID(native))
			}
			impl.processMenu(ptrFromID(native), menu)
			if !get[bool](idFromPtr(item.impl.(*macosMenuItem).nsMenuItem), "isHidden") {
				result <- "submenu label became visible during creation or rebuild"
				return
			}
		}
		result <- ""
	})
	select {
	case problem := <-result:
		if problem != "" {
			t.Fatal(problem)
		}
	case <-time.After(5 * time.Second):
		t.Fatal("submenu construction did not finish")
	}
}
