import React, { useState } from 'react';
import PropTypes from 'prop-types';
import sanitizeHtml from 'sanitize-html';
import Typography from '@mui/material/Typography';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionActions';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Divider from '@mui/material/Divider';
import { useZoneStyles as useStyles } from '../personalspace/PersonalZone';
import { useAppContext } from '../../contexts/context';

const IntroductionAccordion = ({ summary, head = '', body, startExpanded = false }) => {
  const [{ isMobile }] = useAppContext();
  const [isExpanded, setIsExpanded] = useState(startExpanded || false);
  const toggleExpand = () => setIsExpanded(!isExpanded);
  const { classes } = useStyles(isMobile);

  return (
    <Accordion className={`${classes.expansionpanel} ${classes.cursorPointer}`} expanded={isExpanded}>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon className={classes.cursorPointer} />}
        className={classes.cursorPointer}
        onClick={toggleExpand}
      >
        <Typography variant="h5" color="primary" className={classes.zone}>
          {summary}
        </Typography>
      </AccordionSummary>
      <AccordionDetails style={{ display: 'block' }}>
        {head && (
          <>
            <Typography variant={isMobile ? 'h6' : 'h4'}>{head}</Typography> <Divider />
          </>
        )}
        <div style={{ padding: '10px' }} dangerouslySetInnerHTML={{ __html: sanitizeHtml( body ) || '' }} />
      </AccordionDetails>
    </Accordion>
  );
};

IntroductionAccordion.propTypes = {
  summary: PropTypes.string.isRequired,
  body: PropTypes.string.isRequired,
  head: PropTypes.string,
  startExpanded: PropTypes.bool,
};

IntroductionAccordion.defaultProps = {
  startExpanded: false,
  head: '',
};

export default IntroductionAccordion;
