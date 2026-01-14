import { Box } from "@chakra-ui/react";

function Card(props) {
    const { variant, children, className, ...rest } = props;

    return (
        <Box
            bg='white'
            _dark={{ bg: 'gray.800', borderColor: 'gray.700' }}
            border='1px solid'
            borderColor='gray.100'
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
