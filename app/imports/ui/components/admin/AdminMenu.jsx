import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { useTracker } from 'meteor/react-meteor-data';
import { Counts } from 'meteor/tmeasday:publish-counts';
import { Roles } from 'meteor/alanning:roles';
import i18n from 'meteor/universe:i18n';
import Chip from '@material-ui/core/Chip';
import Box from '@material-ui/core/Box';
import List from '@material-ui/core/List';
import PeopleAltIcon from '@material-ui/icons/People';
import GroupWorkIcon from '@material-ui/icons/GroupWork';
import BusinessIcon from '@material-ui/icons/Business';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import PersonAddIcon from '@material-ui/icons/PersonAdd';
import HttpIcon from '@material-ui/icons/Http';
import LocalOfferIcon from '@material-ui/icons/LocalOffer';
import SettingsInputComponentIcon from '@material-ui/icons/SettingsInputComponent';
import SettingsIcon from '@material-ui/icons/Settings';
import CategoryIcon from '@material-ui/icons/Category';
import HomeIcon from '@material-ui/icons/Home';
import Drawer from '@material-ui/core/Drawer';
import Typography from '@material-ui/core/Typography';
import Toolbar from '@material-ui/core/Toolbar';
import Divider from '@material-ui/core/Divider';
import { useHistory, useLocation } from 'react-router-dom';
import updateDocumentTitle from '../../utils/updateDocumentTitle';
import { useAppContext } from '../../contexts/context';

const { disabledFeatures } = Meteor.settings.public;

// CSS
const useStyles = (isMobile) =>
  makeStyles(() => ({
    drawer: {
      width: isMobile ? 65 : 300,
      overflowX: 'hidden',
      '& *': {
        overflowX: 'hidden',
      },
      '& .MuiDrawer-paper': {
        marginTop: 48,
        width: isMobile ? 65 : 300,
        zIndex: 0,
      },
    },
  }));

export default function AdminMenu() {
  const [{ user, isMobile }] = useAppContext();
  const classes = useStyles(isMobile)();
  const { pathname } = useLocation();
  const history = useHistory();

  const requestsCount = useTracker(() => {
    Meteor.subscribe('users.request.count');
    return Counts.get('users.request.count');
  });

  const isAdmin = Roles.userIsInRole(user._id, 'admin');
  const isAdminStructure = Roles.userIsInRole(user._id, 'adminStructure', user.structure);

  const handleMenuClick = (item) => {
    updateDocumentTitle(i18n.__(`components.MainMenu.${item.content}`));
    history.push(item.path);
  };
  const adminMenu = [
    {
      path: '/admin/groups',
      content: 'menuAdminGroups',
      icon: <GroupWorkIcon />,
      hidden: !isAdmin || disabledFeatures.groups,
    },
    {
      path: '/admin/services',
      content: 'menuAdminServices',
      icon: <SettingsInputComponentIcon />,
      hidden: !isAdmin,
    },
    {
      path: '/admin/categories',
      content: 'menuAdminCategories',
      icon: <CategoryIcon />,
      hidden: !isAdmin,
    },
    {
      path: '/admin/tags',
      content: 'menuAdminTags',
      icon: <LocalOfferIcon />,
      hidden: !isAdmin,
    },
    {
      path: '/admin/users',
      content: 'menuAdminUsers',
      icon: <PeopleAltIcon />,
      hidden: !isAdmin,
    },
    {
      path: '/admin/usersvalidation',
      content: 'menuAdminUserValidation',
      icon: <PersonAddIcon />,
      chip: requestsCount,
      hidden: !isAdmin,
    },
    {
      path: '/admin/nextcloudurl',
      content: 'menuAdminNextcloudUrl',
      hidden: !isAdmin || !Meteor.settings.public.groupPlugins.nextcloud.enable,
      icon: <HttpIcon />,
    },
    {
      path: '/admin/structures',
      content: 'menuUserStructure',
      hidden: !isAdmin,
      icon: <BusinessIcon />,
    },
    {
      path: '/admin/settings',
      content: 'menuAdminAppSettings',
      icon: <SettingsIcon />,
      hidden: !isAdmin,
    },
    {
      path: 'adminDivider',
      content: 'Divider',
    },
    {
      path: '/admin/structureservices',
      content: 'menuAdminStructureServices',
      icon: <SettingsInputComponentIcon />,
      hidden: !isAdminStructure,
    },
    {
      path: '/admin/structureusers',
      content: 'menuAdminStructureUsers',
      icon: <PeopleAltIcon />,
      hidden: !isAdminStructure,
    },
    {
      path: 'adminDivider2',
      content: 'Divider',
    },
    {
      path: '/',
      content: 'menuAdminBackHome',
      icon: <HomeIcon />,
    },
  ];

  return (
    <Drawer variant="permanent" className={classes.drawer}>
      {!isMobile && (
        <Toolbar>
          <Typography variant="h6">{i18n.__('components.AdminMenu.title')}</Typography>
        </Toolbar>
      )}
      <Box sx={{ overflow: 'auto' }}>
        <List>
          {adminMenu.map(({ content, path, icon, hidden, chip }) =>
            content === 'Divider' ? (
              <Divider key={path} />
            ) : (
              !hidden && (
                <ListItem
                  onClick={() => handleMenuClick({ content, path })}
                  button
                  key={content}
                  selected={pathname === path}
                >
                  <ListItemIcon>{!chip ? icon : <Chip size="small" label={chip} color="secondary" />}</ListItemIcon>
                  {!isMobile && <ListItemText primary={i18n.__(`components.AdminMenu.${content}`)} />}
                </ListItem>
              )
            ),
          )}
        </List>
      </Box>
    </Drawer>
  );
}
