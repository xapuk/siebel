with io as (  -- IO/IC/Field
  SELECT io.repository_id, io.name IO, ic.name IC, ic.ext_name BC, nvl(ifu.value, iff.ext_name) FIELD
  FROM siebel.S_INT_OBJ io
       join siebel.S_INT_COMP ic on io.row_id = ic.int_obj_id
            and ic.inactive_flg = 'N'
       join siebel.S_INT_FIELD iff on iff.int_comp_id = ic.row_id 
            and iff.inactive_flg = 'N' 
            and iff.field_type_cd = 'Data'
       left join siebel.S_INTFLD_UPROP ifu on ifu.int_field_id = iff.row_id  -- MVF
            and ifu.inactive_flg = 'N' 
            and ifu.name in ('MVGFieldName', 'AssocFieldName')
  where io.base_obj_type = 'Siebel Business Object'
        and io.inactive_flg = 'N'), 
        
bc as ( -- BC/Field
  select bc.repository_id, bc.name BC, f.name FIELD 
  from siebel.S_BUSCOMP bc 
      join siebel.S_FIELD f on f.buscomp_id = bc.row_id 
        and f.inactive_flg = 'N')
  
select io.io, io.ic, io.field, io.bc 
from io 
  join siebel.S_REPOSITORY r on r.row_id = io.repository_id
where r.name = 'Siebel Repository'
    and io.field not in ('Id','Conflict Id','Created','Created By','Mod Id','Updated','Updated By', 'SSA Primary Field', 'IsPrimaryMVG') -- excluding system fields
    and (bc, field) not in (select bc, field from bc where repository_id = r.row_id)
and io.io like 'AMS%'; -- to filter by your project preffix
