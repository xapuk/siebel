-- free form S_AUDIT_ITEM select should include at least ROW_ID, AUDIT_LOG, BUSCOMP_NAME, TBL_NAME columns
with user_select as (
    select *
    from siebel.S_AUDIT_ITEM
    where AUDIT_LOG is not null and rownum <= 5
    order by row_id desc
),
-- splits audit_log value into tokens
tokens (ROW_ID, LVL, AUDIT_LOG, BUSCOMP_NAME, TBL_NAME, REMAIN, TOKEN_LEN, TOKEN, NEW_POS) as (
    -- maybe it is worth fetching first token here?
    select ROW_ID, 0 LVL, AUDIT_LOG, BUSCOMP_NAME, TBL_NAME,
        AUDIT_LOG REMAIN,
        0 TOKEN_LEN,
        null TOKEN,
        1 NEW_POS
    from user_select
    union all
    select i.ROW_ID, p.LVL + 1 LVL, i.AUDIT_LOG, i.BUSCOMP_NAME, i.TBL_NAME,
        SUBSTR(p.AUDIT_LOG, p.NEW_POS) REMAIN,  -- remaining AUDIT_LOG value after cutting processed tokens (for debugging)
        TO_NUMBER(REGEXP_SUBSTR(i.AUDIT_LOG, '(\d*)\*', p.NEW_POS, 1, '', 1)) TOKEN_LEN, -- length of the following token (for debugging)
         -- token lenght comes before * and then a comes a token of that lenght
        REGEXP_SUBSTR(p.AUDIT_LOG, '\*(.{' || REGEXP_SUBSTR(i.AUDIT_LOG, '(\d*)\*', p.NEW_POS, 1, '', 1) || '})', p.NEW_POS, 1, '', 1) TOKEN,
        -- position at which starts next token length (current position + token lenght + lenght of token lenght + 1(* sign))
        p.NEW_POS + TO_NUMBER(REGEXP_SUBSTR(i.AUDIT_LOG, '(\d*)\*', p.NEW_POS, 1, '', 1)) + length(REGEXP_SUBSTR(i.AUDIT_LOG, '(\d*)\*', p.NEW_POS, 1, '', 1)) + 1 NEW_POS
    from user_select i
        join tokens p on p.ROW_ID = i.ROW_ID and p.NEW_POS < length(i.AUDIT_LOG) -- recursive join until we reach the end of AUDIT_LOG value
),
-- group tokens into C,N,O,J,L,K arrays and number rows
blocks (ROW_ID, LVL, AUDIT_LOG, BUSCOMP_NAME, TBL_NAME, TOKEN, TYPE, ROWCNT, NUM) as (
    select ROW_ID, LVL, AUDIT_LOG, BUSCOMP_NAME, TBL_NAME, TOKEN, 
        TO_CHAR(SUBSTR(TOKEN, 1, 1)) TYPE, -- first token indicates the meaning of following tokens (C, N, O, J, L, K)
        TO_NUMBER(SUBSTR(TOKEN, 2)) ROWCNT, -- and a count of following tokens
        0 NUM -- mark first(technical) token to filter it out later
    from tokens
    where lvl = 1
    union all
    select t.ROW_ID, t.LVL, t.AUDIT_LOG, t.BUSCOMP_NAME, t.TBL_NAME, t.TOKEN, 
        CASE WHEN p.ROWCNT = p.NUM  -- fetch next technical token after reached the end of token array
            THEN TO_CHAR(SUBSTR(t.TOKEN, 1, 1))
            ELSE p.TYPE
        END TYPE,
        CASE WHEN p.ROWCNT = p.NUM
            THEN TO_NUMBER(SUBSTR(t.TOKEN, 2))
            ELSE p.ROWCNT
        END ROWCNT,
        CASE WHEN p.ROWCNT = p.NUM -- also reset a row number
            THEN 0
            ELSE p.NUM + 1
        END NUM
    from tokens t
        join blocks p on t.row_id = p.row_id and t.lvl = p.lvl + 1
),
-- combine arrays into records and map columns into fields
recs as (
    -- J(oin) entries are recorded with field names
    select j.*, to_char(j.token) FIELD_NAME, o.token OLD_VAL, n.token NEW_VAL
    from blocks j
        join blocks n on n.row_id = j.row_id and n.num = j.num and n.type = 'L'
        join blocks o on o.row_id = j.row_id and o.num = j.num and o.type = 'K'
    where j.num > 0 and j.type = 'J'
    union all
    -- C(olumn) entries need to be mapped to field names through [Administration - Audit Trail]
    select c.*, NVL(a.field_name, to_char(c.token)) FIELD_NAME, o.token OLD_VAL, n.token NEW_VAL
    from blocks c
        join blocks n on n.row_id = c.row_id and n.num = c.num and n.type = 'N'
        join blocks o on o.row_id = c.row_id and o.num = c.num and o.type = 'O'
        left join (
            select b.buscomp_name, f.tbl_name, f.col_name, f.field_name,
                ROW_NUMBER() OVER (PARTITION BY b.buscomp_name, f.tbl_name, f.col_name ORDER BY f.created desc) row_num
            from siebel.S_AUDIT_BUSCOMP b
                join siebel.S_AUDIT_FIELD f on f.audit_bc_id = b.row_id
        ) a on a.col_name = to_char(c.token) and a.buscomp_name = c.buscomp_name and a.tbl_name = c.tbl_name and row_num = 1 -- fetching only last created field entry
    where c.num > 0 and c.type = 'C'
)
select ROW_ID, NUM, FIELD_NAME, NEW_VAL, OLD_VAL 
from recs 
    -- here you can join original S_AUDIT_LOG records by ROW_ID if you need more info
order by ROW_ID desc, TYPE desc, NUM asc;
