import { Box, useStyleConfig, useColorModeValue } from "@chakra-ui/react";

function Card(props) {
    const { variant, children, className, ...rest } = props;
    const styles = useStyleConfig("Card", { variant });
    const bg = useColorModeValue('white', 'gray.800');
    const borderColor = useColorModeValue('gray.100', 'gray.700');

    return (
        <Box
            __css={styles}
            bg={bg}
            border='1px solid'
            borderColor={borderColor}
            borderRadius='20px' // Soft rounded corners
            className={`${className ? className + " " : ""}responsive-card`}
            boxShadow="0px 4px 12px rgba(0, 0, 0, 0.05)" // Professional soft shadow
            transition="all 0.3s ease"
            _hover={{
                transform: 'translateY(-2px)',
                boxShadow: "0px 8px 24px rgba(0, 0, 0, 0.1)"
            }}
            {...rest}
        >
            {children}
        </Box>
    );
}

export default Card;
