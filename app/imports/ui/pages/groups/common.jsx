import React from 'react';
import PropTypes from 'prop-types';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import Tooltip from '@material-ui/core/Tooltip';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import IconButton from '@material-ui/core/IconButton';
import Grid from '@material-ui/core/Grid';
import Pagination from '@material-ui/lab/Pagination';
import SearchField from '../../components/system/SearchField';

const GroupListActions = ({ url, title }) => {
  return (
    <ListItemSecondaryAction>
      <Tooltip title={title} aria-label="add">
        <IconButton edge="end" aria-label="comments" onClick={() => window.open(url, '_blank', 'noreferrer,noopener')}>
          <ChevronRightIcon />
        </IconButton>
      </Tooltip>
    </ListItemSecondaryAction>
  );
};

GroupListActions.propTypes = {
  url: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
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
