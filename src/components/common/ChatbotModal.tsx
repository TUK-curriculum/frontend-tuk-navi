import React from "react";
import { Dialog, IconButton, Box, Typography, useMediaQuery } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import Chatbot from "../../pages/Chatbot";
import Mascot from "./Mascot";

interface ChatbotModalProps {
    open: boolean;
    onClose: () => void;
}

const ChatbotModal: React.FC<ChatbotModalProps> = ({ open, onClose }) => {
    const isMobile = useMediaQuery('(max-width:600px)');

    return (
        <Dialog
            open={open}
            onClose={onClose}
            PaperProps={{
                sx: {
                    borderRadius: 5,
                    maxWidth: 700,
                    minWidth: 340,
                    width: '98vw',
                    minHeight: 480,
                    maxHeight: '90vh',
                    p: 0,
                    m: 0,
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                },
            }}
            sx={{ zIndex: 2100, p: 0 }}
        >
            <Box sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                px: { xs: 2, sm: 3 },
                py: { xs: 1.5, sm: 2 },
                borderBottom: '1px solid #e5e7eb',
                bgcolor: 'rgba(255,255,255,0.92)',
                position: 'relative',
                zIndex: 2,
                gap: 2,
            }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Mascot size={32} style={{ marginRight: 4 }} />
                    <Box>
                        <Typography variant="h6" fontWeight={900} sx={{ fontSize: 20, color: '#22223b', lineHeight: 1.2 }}>
                            AI 커리큘럼 상담
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500, fontSize: 14, mt: 0.2 }}>
                            AI가 분석하여 개인화된 커리큘럼과 시간표를 추천해드립니다
                        </Typography>
                    </Box>
                </Box>
                <IconButton
                    onClick={onClose}
                    sx={{
                        color: '#1976D2',
                        ml: 1,
                    }}
                    aria-label="챗봇 닫기"
                >
                    <CloseIcon />
                </IconButton>
            </Box>
            <Box sx={{
                flex: 1,
                minHeight: 0,
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                p: isMobile ? 0.5 : 2
            }}>
                <Chatbot isModal={true} />
            </Box>
        </Dialog>
    );
};

export default ChatbotModal; 