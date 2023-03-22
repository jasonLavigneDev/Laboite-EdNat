import React from 'react';
import PropTypes from 'prop-types';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import Tooltip from '@mui/material/Tooltip';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import IconButton from '@mui/material/IconButton';
import Grid from '@mui/material/Grid';
import Pagination from '@mui/material/Pagination';
import SearchField from '../../components/system/SearchField';

const GroupListActions = ({ url, title, disable }) => {
  return (
    <ListItemSecondaryAction>
      <Tooltip title={title} aria-label="add">
        <IconButton
          edge="end"
          aria-label="comments"
          disabled={disable}
          onClick={() => window.open(url, '_blank', 'noreferrer,noopener')}
          size="large"
        >
          <ChevronRightIcon />
        </IconButton>
      </Tooltip>
    </ListItemSecondaryAction>
  );
};

GroupListActions.defaultProps = {
  disable: false,
};

GroupListActions.propTypes = {
  url: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  disable: PropTypes.bool,
};

const GroupSearch = ({ update, reset, search, label }) => {
  return (
    <Grid item xs={12} sm={12} md={6}>
      <SearchField updateSearch={update} search={search} resetSearch={reset} label={label} />
    </Grid>
  );
};

GroupSearch.propTypes = {
  update: PropTypes.func.isRequired,
  reset: PropTypes.func.isRequired,
  search: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
};

const GroupPaginate = ({ total, nbItems, cls, page, handler }) => {
  return (
    total > nbItems && (
      <Grid item xs={12} sm={12} md={6} lg={6} className={cls}>
        <Pagination count={Math.ceil(total / nbItems)} page={page} onChange={handler} />
      </Grid>
    )
  );
};

GroupPaginate.propTypes = {
  total: PropTypes.number.isRequired,
  nbItems: PropTypes.number.isRequired,
  cls: PropTypes.string.isRequired,
  page: PropTypes.number.isRequired,
  handler: PropTypes.func.isRequired,
};

export { GroupListActions, GroupSearch, GroupPaginate };
