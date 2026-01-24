import { Box, useStyleConfig } from "@chakra-ui/react";
function Card(props) {
  const { variant, children, className, ...rest } = props;
  const styles = useStyleConfig("Card", { variant });

  return (
    <Box
      __css={styles}
      className={`${className ? className + " " : ""}responsive-card`}
      transition="transform .15s ease, box-shadow .15s ease"
      _hover={{ transform: 'translateY(-4px)', boxShadow: 'lg' }}
      {...rest}
    >
      {children}
    </Box>
  );
}

export default Card;
