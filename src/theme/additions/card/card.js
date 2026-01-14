import { mode } from '@chakra-ui/theme-tools';
const Card = {
  baseStyle: (props) => ({
    p: '20px',
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    position: 'relative',
    borderRadius: '20px',
    minWidth: '0px',
    wordWrap: 'break-word',
    bg: mode(
      'rgba(255, 255, 255, 0.35)',
      'rgba(15, 23, 42, 0.55)'
    )(props),
    boxShadow: mode(
      '0 18px 45px rgba(15, 23, 42, 0.12)',
      '0 18px 45px rgba(0, 0, 0, 0.55)'
    )(props),
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: mode(
      'rgba(255, 255, 255, 0.6)',
      'rgba(148, 163, 184, 0.35)'
    )(props),
    backdropFilter: 'blur(18px)',
    backgroundClip: 'border-box',
  }),
};

export const CardComponent = {
  components: {
    Card,
  },
};
