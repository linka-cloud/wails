//go:build darwin && purego && !ios && !server

package application

import (
	"fmt"
	"testing"
	"time"

	"github.com/ebitengine/purego/objc"
	"github.com/wailsapp/wails/v3/pkg/icons"
)

func TestMacOSMenuItemSubtitleUpdatesNativeItem(t *testing.T) {
	if !appKitReady {
		t.Skip("AppKit is unavailable")
	}
	result := make(chan error, 1)
	scheduleOnMainForTest(func() {
		item := NewMenuItem("Connected").SetSubtitle("work.example.com")
		item.impl = newMenuItemImpl(item)
		defer item.Destroy()
		row := idFromPtr(item.impl.(*macosMenuItem).nsMenuItem)
		nativeSubtitle := respondsTo(row, "setSubtitle:")
		check := func(label, subtitle string) error {
			if nativeSubtitle && row.send("subtitle").string() != subtitle {
				return fmt.Errorf("native subtitle = %q, want %q", row.send("subtitle").string(), subtitle)
			}
			if !nativeSubtitle && subtitle != "" {
				label += " — " + subtitle
			}
			if got := row.send("title").string(); got != label {
				return fmt.Errorf("native title = %q, want %q", got, label)
			}
			return nil
		}
		if err := check("Connected", "work.example.com"); err != nil {
			result <- err
			return
		}
		item.SetLabel("Connecting").SetSubtitle("home.example.com")
		if err := check("Connecting", "home.example.com"); err != nil {
			result <- err
			return
		}
		item.SetSubtitle("")
		result <- check("Connecting", "")
	})
	select {
	case err := <-result:
		if err != nil {
			t.Fatal(err)
		}
	case <-time.After(5 * time.Second):
		t.Fatal("native menu update timed out")
	}
}

func TestMacOSMenuInsertsFullyConfiguredRows(t *testing.T) {
	if !appKitReady {
		t.Skip("AppKit is unavailable")
	}
	result := make(chan error, 1)
	scheduleOnMainForTest(func() {
		menu := NewMenu()
		defer menu.Destroy()
		menu.Add("Connected").SetSubtitle("work.example.com").SetBitmap(icons.SystrayLight).SetEnabled(false)
		menu.AddSubmenu("Networks").Add("Work")
		native := createNSMenu("")
		defer native.send("release")

		added := 0
		incomplete := false
		center := class("NSNotificationCenter").send("defaultCenter")
		block := objc.NewBlock(func(_ objc.Block, _ objc.ID) {
			index := added % 2
			added++
			row := native.send("itemAtIndex:", index)
			if index == 0 && row.send("image").isNil() {
				incomplete = true
			}
			if index == 1 && row.send("submenu").isNil() {
				incomplete = true
			}
		})
		token := center.send("addObserverForName:object:queue:usingBlock:",
			nsString("NSMenuDidAddItemNotification"), native, objc.ID(0), block)
		block.Release()
		defer center.send("removeObserver:", token)

		impl := newMenuImpl(menu)
		impl.processMenu(ptrFromID(native), menu)
		clearNSMenu(ptrFromID(native))
		impl.processMenu(ptrFromID(native), menu)
		if added != 4 || incomplete {
			result <- fmt.Errorf("rows must already have their bitmap or submenu when inserted: insertions=%d, incomplete=%v", added, incomplete)
			return
		}
		result <- nil
	})
	select {
	case err := <-result:
		if err != nil {
			t.Fatal(err)
		}
	case <-time.After(5 * time.Second):
		t.Fatal("menu rebuild timed out")
	}
}
