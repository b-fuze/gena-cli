## GENA CLI
GENA is a CLI client/interface for the ANV downloader daemon. It can connect to remote daemons or spawn local daemons if desired.

### Architecture
GENA simply renders the current state (as retrieved from the connected daemon) into a terminal interface with a header describing the focused pane, a footer describing the applicable shortcuts to the current view, and a middle scrollable pane that is the main view.
