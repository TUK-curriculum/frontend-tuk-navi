import React, { useEffect, useState } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Button, Stack, Typography, IconButton, TextField
} from '@mui/material';
import { Delete, Edit, Save, Cancel } from '@mui/icons-material';
import { apiClient } from '@/utils/apiClient';

const GraduationRequirement = () => {
    const [rows, setRows] = useState<any[]>([]);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editValues, setEditValues] = useState<any>({});

    const fetchRequirements = async () => {
        try {
            const res = await apiClient.dataManagement.graduationRequirements.getAll();
            setRows(res);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchRequirements();
    }, []);

    // 추가
    const handleAdd = async () => {
        await apiClient.dataManagement.graduationRequirements.create({
            entry_year_start: 2025,
            entry_year_end: undefined,
            total_credits: 130,
            liberal_arts: 37,
            major: 69,
        });
        fetchRequirements();
    };

    // 수정 시작
    const handleEdit = (row: any) => {
        setEditingId(row.id);
        setEditValues(row);
    };

    // 입력 변경
    const handleChange = (field: string, value: any) => {
        setEditValues({ ...editValues, [field]: value });
    };

    // 저장
    const handleSave = async (id: number) => {
        await apiClient.dataManagement.graduationRequirements.update(id, editValues);
        setEditingId(null);
        fetchRequirements();
    };

    // 취소
    const handleCancel = () => {
        setEditingId(null);
        setEditValues({});
    };

    // 삭제
    const handleDelete = async (id: number) => {
        if (!window.confirm("정말 삭제하시겠습니까?")) return;
        await apiClient.dataManagement.graduationRequirements.delete(id);
        fetchRequirements();
    };

    const formatYearRange = (start: number, end: number | null) => {
        if (!end) return `${start} ~ 현재`;
        if (start === end) return `${start}`;
        return `${start} ~ ${end}`;
    };

    return (
        <TableContainer component={Paper} sx={{ mt: 2 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ p: 2 }}>
                <Typography variant="h6">졸업 요건</Typography>
                <Button variant="contained" onClick={handleAdd}>추가</Button>
            </Stack>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>학번</TableCell>
                        <TableCell>총 학점</TableCell>
                        <TableCell>교양 학점</TableCell>
                        <TableCell>전공 학점</TableCell>
                        <TableCell>작업</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                {rows.map((row) => (
                    <TableRow key={row.id}>
                        <TableCell>
                            {editingId === row.id ? (
                            <Stack direction="row" spacing={1}>
                                <TextField
                                    size="small"
                                    value={editValues.entry_year_start}
                                    onChange={(e) => handleChange("entry_year_start", Number(e.target.value))}
                                    sx={{ width: 80 }}
                                />
                                ~
                                <TextField
                                    size="small"
                                    value={editValues.entry_year_end ?? ""}
                                    onChange={(e) => handleChange("entry_year_end", e.target.value ? Number(e.target.value) : null)}
                                    sx={{ width: 80 }}
                                />
                            </Stack>
                            ) : (
                                formatYearRange(row.entry_year_start, row.entry_year_end)
                            )}
                        </TableCell>

                        <TableCell>
                            {editingId === row.id ? (
                            <TextField
                                size="small"
                                value={editValues.total_credits}
                                onChange={(e) => handleChange("total_credits", Number(e.target.value))}
                                sx={{ width: 80 }}
                            />
                            ) : row.total_credits}
                        </TableCell>

                        <TableCell>
                            {editingId === row.id ? (
                            <TextField
                                size="small"
                                value={editValues.liberal_arts}
                                onChange={(e) => handleChange("liberal_arts", Number(e.target.value))}
                                sx={{ width: 80 }}
                            />
                            ) : row.liberal_arts}
                        </TableCell>

                        <TableCell>
                            {editingId === row.id ? (
                            <TextField
                                size="small"
                                value={editValues.major}
                                onChange={(e) => handleChange("major", Number(e.target.value))}
                                sx={{ width: 80 }}
                            />
                            ) : row.major}
                        </TableCell>

                        <TableCell>
                            {editingId === row.id ? (
                            <Stack direction="row" spacing={1}>
                                <IconButton color="primary" onClick={() => handleSave(row.id)}>
                                    <Save />
                                </IconButton>
                                <IconButton color="inherit" onClick={handleCancel}>
                                    <Cancel />
                                </IconButton>
                            </Stack>
                            ) : (
                            <Stack direction="row" spacing={1}>
                                <IconButton color="primary" onClick={() => handleEdit(row)}>
                                    <Edit />
                                </IconButton>
                                <IconButton color="error" onClick={() => handleDelete(row.id)}>
                                    <Delete />
                                </IconButton>
                            </Stack>
                            )}
                        </TableCell>
                    </TableRow>
                ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

export default GraduationRequirement;