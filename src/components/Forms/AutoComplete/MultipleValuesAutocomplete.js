import React from "react";
import { Autocomplete, TextField, Chip } from "@mui/material";

export const MultipleValuesAutocomplete = ({
  options,
  value,
  onChange,
  label,
  placeholder
}) => {
  return (
    <Autocomplete
      multiple
      options={options}
      value={value}
      onChange={onChange}
      getOptionLabel={(option) => option.label}
      renderInput={(params) => (
        <TextField
          {...params}
          variant="outlined"
          label={label}
          placeholder={placeholder}
          fullWidth
        />
      )}
      renderTags={(value, getTagProps) =>
        value.map((option, index) => (
          <Chip
            label={option.label}
            {...getTagProps({ index })}
          
          />
        ))
      }
    />
  );
};
