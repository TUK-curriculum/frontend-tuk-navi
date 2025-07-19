import React from "react";
import { AppBar, Toolbar, Box } from "@mui/material";

const APPBAR_HEIGHT = 64; // px
const TOP_RATIO = 0.25;   // 25% (0.2~0.3 추천)
const TOP_MIN_HEIGHT = 120;
const BODY_MIN_HEIGHT = 240;

interface PageLayoutProps {
    top: React.ReactNode;
    children: React.ReactNode;
    bodyAlign?: "center" | "flex-start" | "flex-end" | "stretch";
    bodyJustify?: "center" | "flex-start" | "flex-end" | "space-between" | "space-around" | "space-evenly";
}

const PageLayout: React.FC<PageLayoutProps> = ({
    top,
    children,
    bodyAlign = "center",
    bodyJustify = "center",
}) => {
    return (
        <Box sx={{ height: "100vh", display: "flex", flexDirection: "column" }}>
            {/* AppBar 고정 */}
            <AppBar position="fixed" sx={{ height: APPBAR_HEIGHT, zIndex: 1201 }}>
                <Toolbar>서비스명</Toolbar>
            </AppBar>
            {/* AppBar 아래 전체 컨테이너 */}
            <Box
                sx={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    pt: `${APPBAR_HEIGHT}px`, // AppBar만큼 아래로
                    minHeight: 0,
                }}
            >
                {/* Top 영역: 비율+최소높이+반응형 */}
                <Box
                    sx={{
                        flex: `0 0 ${TOP_RATIO * 100}%`,
                        minHeight: TOP_MIN_HEIGHT,
                        maxHeight: { xs: 200, md: 320 },
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "flex-start",
                        px: { xs: 2, md: 4 },
                        pb: 2,
                        boxSizing: "border-box",
                    }}
                >
                    {top}
                </Box>
                {/* Body 영역: 비율+최소높이+중앙/상단 정렬 선택 */}
                <Box
                    sx={{
                        flex: `1 1 ${100 - TOP_RATIO * 100}%`,
                        minHeight: BODY_MIN_HEIGHT,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: bodyAlign,
                        justifyContent: bodyJustify,
                        px: { xs: 2, md: 4 },
                        pb: 4,
                        gap: 3,
                        boxSizing: "border-box",
                        overflow: "hidden", // 스크롤 없이 보기 좋은 비율
                    }}
                >
                    {children}
                </Box>
            </Box>
        </Box>
    );
};

export default PageLayout; 