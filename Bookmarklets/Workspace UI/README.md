# Welcome to [Inspect Workspace UI] by xapuk.com

Another usefull bookmarklet which allows to open/inspect any workspace in a a couple of clicks without loosing you current context and much faster.

Text field accepts several formats:
- an exact workspace name: vbabkin_20200924_d419_1
- a search pattern of workspace name: \*d419\*
- an exact search spec for Repository Workspace BC: [Parent Name] = "Release 21" AND [Created By] = LoginId()
- leave it empty to search / inspect most recent in-progress workspaces created by active user

Hit Enter to search for 10 most recent workspaces matching provided name / pattern / spec, and then click one of the workspaces in the list to inspect it.
Hit Ctrl+Enter to inspectthe most recent workspaces matching provided name / pattern / spec.

The most common use scenario I can think of is when you need to inspect / re-inspect your recent in-progress workspace. In that case just hit Ctrl+Enter upon openning a dialog or double click a bookmark link.
I asume that you want a dialog to close after sucessful inspect, so I made it close once you hover over the dialog border.

In order for that UI to work you'll require a backend part as well:
- download and import [FWK Runtime] business service(BS) if you haven't already
- publish the BS through application user property [Business Service n]
- if you don't want BS to be migrated to higher environments along with repository, just import it as a client-side business service
- good luck testing the UI on old worspaces which doesn't yet have an application user prop ;)

Checkout http://xapuk.com/ for more information.