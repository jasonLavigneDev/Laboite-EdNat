import React from 'react';
import { makeStyles } from 'tss-react/mui';
import { useTracker } from 'meteor/react-meteor-data';
import { Counts } from 'meteor/tmeasday:publish-counts';
import { Roles } from 'meteor/alanning:roles';
import i18n from 'meteor/universe:i18n';
import Chip from '@mui/material/Chip';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import PeopleAltIcon from '@mui/icons-material/People';
import GroupWorkIcon from '@mui/icons-material/GroupWork';
import BusinessIcon from '@mui/icons-material/Business';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import HttpIcon from '@mui/icons-material/Http';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import SettingsInputComponentIcon from '@mui/icons-material/SettingsInputComponent';
import SettingsIcon from '@mui/icons-material/Settings';
import CategoryIcon from '@mui/icons-material/Category';
import HomeIcon from '@mui/icons-material/Home';
import HelpIcon from '@mui/icons-material/Help';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import Drawer from '@mui/material/Drawer';
import Typography from '@mui/material/Typography';
import Toolbar from '@mui/material/Toolbar';
import Divider from '@mui/material/Divider';
import { useHistory, useLocation } from 'react-router-dom';
import updateDocumentTitle from '../../utils/updateDocumentTitle';
import { useAppContext } from '../../contexts/context';
import AppSettings from '../../../api/appsettings/appsettings';

const { disabledFeatures } = Meteor.settings.public;

// CSS
const useStyles = makeStyles()((theme, isMobile) => ({
  drawer: {
    width: isMobile ? 65 : 300,
    overflowX: 'hidden',
    '& *': {
      overflowX: 'hidden',
    },
    '& .MuiDrawer-paper': {
      paddingTop: 48,
      paddingBottom: 48,
      width: isMobile ? 65 : 300,
      zIndex: 0,
    },
  },
}));

export default function AdminMenu() {
  const [{ user, isMobile }] = useAppContext();
  const { classes } = useStyles(isMobile);
  const { pathname } = useLocation();
  const history = useHistory();

  const requestsCount = useTracker(() => {
    Meteor.subscribe('users.request.count');
    return Counts.get('users.request.count');
  });

  const usersAwaitingStructureCount = useTracker(() => {
    Meteor.subscribe('users.awaitingForStructure.count', { structureId: user.structure });
    return Counts.get('users.awaitingForStructure.count');
  });

  const isAdmin = Roles.userIsInRole(user._id, 'admin');
  const isAdminStructure = Roles.userIsInRole(user._id, 'adminStructure', user.structure);

  const { isUserStructureValidationMandatory } = useTracker(() => {
    Meteor.subscribe('appsettings.userStructureValidationMandatory');
    const appSettings = AppSettings.findOne({ _id: 'settings' }, { fields: { userStructureValidationMandatory: 1 } });
    return { isUserStructureValidationMandatory: appSettings?.userStructureValidationMandatory };
  });

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
      path: '/admin/helps',
      content: 'menuAdminHelpPage',
      icon: <HelpIcon />,
      hidden: !isAdmin,
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
      path: '/admin/structuressettings',
      content: 'menuAdminStructureSettings',
      icon: <SettingsIcon />,
      hidden: !isAdminStructure,
    },
    {
      path: '/admin/structureusers',
      content: 'menuAdminStructureUsers',
      icon: <PeopleAltIcon />,
      hidden: !isAdminStructure,
    },
    {
      path: '/admin/substructures',
      content: 'menuAdminOfStructures',
      icon: <BusinessIcon />,
      hidden: !isAdminStructure,
    },
    {
      path: '/admin/structureusersvalidation',
      content: 'menuAdminOfStructureUsersValidation',
      icon: <GroupAddIcon />,
      hidden: !isUserStructureValidationMandatory || !isAdminStructure,
      chip: usersAwaitingStructureCount,
    },
    {
      path: '/admin/structurespaces',
      content: 'menuAdminDefaultSpaces',
      icon: <RestorePageIcon />,
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
