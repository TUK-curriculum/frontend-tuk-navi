import React, { useRef } from 'react';
import { Box, Button } from '@mui/material';
import type { SxProps, Theme } from '@mui/material';
import SendIcon from './SendIcon';

interface InputBarProps {
    value: string;
    onChange: (v: string) => void;
    onSend: () => void;
    disabled: boolean;
    sx?: SxProps<Theme>;
    sendButtonProps?: React.ButtonHTMLAttributes<HTMLButtonElement>;
}

const InputBar = ({ value, onChange, onSend, disabled, sx, sendButtonProps }: InputBarProps) => {
    const inputRef = useRef(null);
    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            onSend();
        }
        if (e.key === 'Enter' && e.shiftKey) {
            onChange(value + '\n');
        }
    };
    return (
        <Box
            sx={{
                width: '100%',
                background: '#f1f5fa',
                borderTop: '1px solid #eee',
                p: 2,
                display: 'flex',
                alignItems: 'center',
                ...sx,
            }}
        >
            <textarea
                ref={inputRef}
                style={{
                    flex: 1,
                    fontSize: 16,
                    padding: '12px 14px',
                    borderRadius: 18,
                    border: '1px solid #e0e7ef',
                    outline: 'none',
                    background: '#fff',
                    marginRight: 12,
                    resize: 'none',
                    minHeight: 40,
                    maxHeight: 90,
                    color: '#22223b',
                }}
                value={value}
                disabled={disabled}
                onChange={e => onChange(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="메시지를 입력하세요 (Enter: 전송, Shift+Enter: 줄바꿈)"
                rows={1}
                maxLength={1000}
            />
            <Button
                variant="contained"
                onClick={onSend}
                disabled={disabled || !value.trim()}
                sx={{
                    minWidth: 44,
                    minHeight: 44,
                    width: 44,
                    height: 44,
                    borderRadius: 100,
                    background: '#0096ff',
                    boxShadow: '0 2px 8px 0 rgba(59,130,246,0.10)',
                    ml: 1,
                    p: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'background 0.2s',
                    '&:hover': {
                        background: '#1da1ff',
                    },
                    '&:active': {
                        background: '#1976d2',
                    },
                    '&:disabled': {
                        background: '#cbd5e1',
                        color: '#64748b',
                    },
                }}
                {...sendButtonProps}
            >
                <SendIcon />
            </Button>
        </Box>
    );
};

export default InputBar; 