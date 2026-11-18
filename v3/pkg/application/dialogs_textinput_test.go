package application

import (
	"bytes"
	"encoding/json"
	"log/slog"
	"strings"
	"testing"
)

func TestTextInputRuntimeDoesNotLogPromptContents(t *testing.T) {
	var output bytes.Buffer
	processor := &MessageProcessor{logger: slog.New(slog.NewTextHandler(&output, &slog.HandlerOptions{Level: slog.LevelDebug}))}
	var args Args
	if err := json.Unmarshal([]byte(`{"Password":true,"DefaultText":"private-password"}`), &args); err != nil {
		t.Fatal(err)
	}
	processor.logRuntimeCall(&RuntimeRequest{Object: dialogRequest, Method: DialogTextInput, Args: &args})
	if strings.Contains(output.String(), "private-password") {
		t.Fatal("password prompt contents appeared in runtime logs")
	}
	if !strings.Contains(output.String(), "TextInput") {
		t.Fatal("text input method was not logged")
	}
}
