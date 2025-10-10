//go:build windows

package w32

import (
	"unsafe"
)

// Minimal constants and structs for retrieving system message font
const (
	SPI_GETNONCLIENTMETRICS = 0x0029
)

// NONCLIENTMETRICS contains the metrics for non-client areas of the windows, including fonts.
// This definition includes iPaddedBorderWidth (Vista+). Wails v3 targets modern Windows where this is available.
// See: https://learn.microsoft.com/windows/win32/api/uxtheme/ns-uxtheme-nonclientmetricsw
// and https://learn.microsoft.com/windows/win32/api/winuser/ns-winuser-nonclientmetricsw
// Note: LOGFONT is already defined in typedef.go
//
// Ordering and sizes must match the Windows SDK layout.
// The fields are intentionally exported with lowercase i* to match MSDN names logically in comments.
// We keep Go naming as-is to avoid confusion and match other codebase types.
//
//nolint:structcheck
//lint:ignore U1000 used via SystemParametersInfo
type NONCLIENTMETRICS struct {
	CbSize             uint32
	IBorderWidth       int32
	IScrollWidth       int32
	IScrollHeight      int32
	ICaptionWidth      int32
	ICaptionHeight     int32
	LfCaptionFont      LOGFONT
	ISmCaptionWidth    int32
	ISmCaptionHeight   int32
	LfSmCaptionFont    LOGFONT
	IMenuWidth         int32
	IMenuHeight        int32
	LfMenuFont         LOGFONT
	LfStatusFont       LOGFONT
	LfMessageFont      LOGFONT
	IPaddedBorderWidth int32 // Vista and later
}

// GetDefaultMessageFont returns the current Windows message font as an HFONT and a boolean indicating
// whether the caller owns the returned font and must delete it with DeleteObject when done.
// If retrieving the system font fails, it falls back to DEFAULT_GUI_FONT and returns own=false.
func GetDefaultMessageFont() (HFONT, bool) {
	var ncm NONCLIENTMETRICS
	ncm.CbSize = uint32(unsafe.Sizeof(ncm))

	// SystemParametersInfoW(SPI_GETNONCLIENTMETRICS, ncm.CbSize, &ncm, 0)
	ret, _, _ := procSystemParametersInfo.Call(
		uintptr(SPI_GETNONCLIENTMETRICS),
		uintptr(ncm.CbSize),
		uintptr(unsafe.Pointer(&ncm)),
		0,
	)

	if ret == 0 {
		// Fallback to stock GUI font; do not delete stock fonts
		return HFONT(GetStockObject(DEFAULT_GUI_FONT)), false
	}

	// Create a font based on the retrieved LOGFONT; caller must delete it
	f := CreateFontIndirect(&ncm.LfMessageFont)
	if f == 0 {
		return HFONT(GetStockObject(DEFAULT_GUI_FONT)), false
	}
	return f, true
}
