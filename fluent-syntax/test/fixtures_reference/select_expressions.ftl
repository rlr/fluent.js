new-messages =
    { BUILTIN() ->
        [0] Zero
       *[other] {""}Other
    }

valid-selector =
    { -term.case ->
       *[key] value
    }

# ERROR
invalid-selector =
    { -term[case] ->
       *[key] value
    }

empty-variant =
    { 1 ->
       *[one] {""}
    }

nested-select =
    { 1 ->
       *[one] { 2 ->
          *[two] Value
       }
    }

# ERROR VariantLists cannot appear in SelectExpressions
nested-variant-list =
    { 1 ->
       *[one] {
          *[two] Value
       }
    }

# ERROR Missing line end after variant list
missing-line-end =
    { 1 ->
        *[one] One}
