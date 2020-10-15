# Welcome to [Inspect Workspace UI] by xapuk.com

Another useful bookmarklet that allows to open/inspect any workspace in a couple of clicks without losing your current context and much faster.

Text field accepts several formats:
- an exact workspace name: vbabkin_20200924_d419_1
- a search pattern of workspace name: \*d419\*
- an exact search spec for Repository Workspace BC: [Parent Name] = "Release 21" AND [Created By] = LoginId()
- leave it empty to search / inspect most recent in-progress workspaces created by active user

Hit Enter to search for 10 most recent workspaces matching the provided name/pattern/spec and then click one of the workspaces in the list to inspect it.
Hit Ctrl+Enter to inspect the most recent workspaces matching the provided name/pattern/spec.

The most common use scenario I can think of is when you need to inspect / re-inspect your recent in-progress workspace. In that case, just hit Ctrl+Enter upon opening a dialog or double click a bookmark link.
You can close a dialog with Esc key, by clicking Close button, clicking outside the dialog or right-click of dialog whitespace.

In order for that UI to work you'll require a backend part as well:
- download and import [FWK Runtime] business service(BS) if you haven't already
- publish the BS through application user property [ClientBusinessService]
- if you don't want BS to be migrated to higher environments along with repository, just import it as a client-side business service

Check out http://xapuk.com/ for more information.

# Version history

version 1.2:
- print placeholder text on empty call
- don't highlight search specs
- lear results before next search
- fix char limit error
- fix hightlight
- print user name instead of "my"

version 1.3:
- placeholder text color
- <> in placeholder text
- when searching for exact ws name, shouldn't highlight it
- link click doesn't work if clicked on highlighted part
- don't close on whitespace click

version 1.4
- change to the layout
- fixed empty call problem
- help text changes