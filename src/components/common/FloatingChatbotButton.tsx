import React from "react";
import { Fab, Box } from "@mui/material";

interface FloatingChatbotButtonProps {
    onClick: () => void;
}

const MemoIcon = () => (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="40" height="40" rx="20" fill="#fef9c3" />
        <rect x="10" y="12" width="20" height="16" rx="3" fill="#fde047" stroke="#facc15" strokeWidth="2" />
        <rect x="13" y="16" width="14" height="2.2" rx="1.1" fill="#fbbf24" />
        <rect x="13" y="20" width="10" height="2.2" rx="1.1" fill="#fbbf24" />
    </svg>
);

const FloatingMemoButton: React.FC<FloatingChatbotButtonProps> = ({ onClick }) => (
    <Box
        sx={{
            position: "fixed",
            right: { xs: 16, md: 32 },
            bottom: { xs: 16, md: 32 },
            zIndex: 2000,
        }}
    >
        <Fab
            color="primary"
            onClick={onClick}
            sx={{
                width: 64,
                height: 64,
                boxShadow: 4,
                background: "#fff",
                p: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}
        >
            <Box
                sx={{
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    overflow: 'hidden',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
                    bgcolor: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <MemoIcon />
            </Box>
        </Fab>
    </Box>
);

export default FloatingMemoButton; 