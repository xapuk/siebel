SELECT distinct
  t.NAME "TABLE", col.NAME "COLUMN",
  b.NAME "BUSCOMP", f.NAME "FIELD", 
  nvl(ci.CAPTION, li.DISPLAY_NAME) "CAPTION", nvl(c.NAME, lc.NAME) "CONTROL", a.NAME "APPLET",
  s.NAME "SCREEN", v.NAME "VIEW", ap.NAME "APPLICATION"
FROM siebel.S_REPOSITORY r
  -- application
  join siebel.S_APPLICATION ap on ap.REPOSITORY_ID = r.ROW_ID
  join siebel.S_PAGE_TAB aps on aps.APPLICATION_ID = ap.ROW_ID and aps.INACTIVE_FLG = 'N'
  -- screen
  join siebel.S_SCREEN s on s.name = aps.SCREEN_NAME and s.REPOSITORY_ID = r.ROW_ID AND s.INACTIVE_FLG = 'N'
  join siebel.S_SCREEN_VIEW sv on sv.screen_id = s.ROW_ID and sv.INACTIVE_FLG = 'N'
  -- view
  join siebel.S_VIEW v on v.REPOSITORY_ID = r.ROW_ID and sv.VIEW_NAME = v.name
  join siebel.S_VIEW_WEB_TMPL vt on vt.VIEW_ID = v.ROW_ID and vt.INACTIVE_FLG = 'N'
  join siebel.S_VIEW_WTMPL_IT vti on vti.VIEW_WEB_TMPL_ID = vt.ROW_ID and vti.INACTIVE_FLG = 'N'
  -- applet (only form, list applets)
  join siebel.S_APPLET a on a.REPOSITORY_ID = r.ROW_ID and a.name = vti.APPLET_NAME
  join siebel.S_APPL_WEB_TMPL w on w.applet_id = a.ROW_ID and w.TYPE = vti.APPLET_MODE_CD and w.INACTIVE_FLG ='N'
  join siebel.S_APPL_WTMPL_IT wi on wi.APPL_WEB_TMPL_ID = w.ROW_ID and wi.INACTIVE_FLG = 'N'
  -- control
  left join siebel.S_CONTROL c on c.APPLET_ID = a.ROW_ID and wi.CTRL_NAME = c.name and c.INACTIVE_FLG = 'N'
  left join siebel.S_LIST l on l.APPLET_ID = a.ROW_ID
  left join siebel.S_LIST_COLUMN lc on lc.LIST_ID = l.ROW_ID and wi.CTRL_NAME = lc.name
  -- control caption (only overrides!)
  left join siebel.S_CONTROL_INTL ci on ci.CONTROL_ID = c.ROW_ID
  left join siebel.S_LIST_COL_INTL li on li.LIST_COLUMN_ID = lc.ROW_ID
  -- buscomp
  join SIEBEL.S_BUSCOMP b on b.name = a.BUSCOMP_NAME and b.REPOSITORY_ID = r.ROW_ID
  -- fields exposed either through control or list column
  join siebel.S_FIELD f on f.BUSCOMP_ID = b.ROW_ID 
    and (lc.FIELD_NAME = f.name or c.FIELD_NAME = f.name)
  -- join
  left join siebel.S_JOIN j on j.name = f.JOIN_NAME and j.BUSCOMP_ID = f.BUSCOMP_ID
  -- table
  join siebel.S_TABLE t on t.REPOSITORY_ID = r.ROW_ID 
    and (t.name = b.TABLE_NAME and f.join_name is null  -- base table
    or t.name = j.DEST_TBL_NAME and j.row_id is not null  -- explicit joins
    or t.name = f.JOIN_NAME and j.row_id is null) -- implicit joins
  -- column
  join siebel.S_COLUMN col on col.TBL_ID = t.ROW_ID and f.COL_NAME = col.name
WHERE r.name = 'Siebel Repository'
  and ap.name LIKE 'Siebel Financial Services'
ORDER BY 1, 2, 3;