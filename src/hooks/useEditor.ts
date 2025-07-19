// hooks/useEditor.ts
import { useState, useEffect, useCallback } from 'react';
import { useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Highlight from '@tiptap/extension-highlight';
import TextStyle from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';

export const useMemoEditor = (initialContent: string, onUpdate: (content: string) => void) => {
    const [linkDialogOpen, setLinkDialogOpen] = useState(false);
    const [linkUrl, setLinkUrl] = useState('');

    const editor = useEditor({
        extensions: [
            StarterKit,
            Highlight,
            TextStyle,
            Color,
            TextAlign.configure({ types: ['heading', 'paragraph'] }),
            Underline,
            Link,
            Placeholder.configure({ placeholder: '메모를 입력하세요...' })
        ],
        content: initialContent,
        onUpdate: ({ editor }) => {
            const content = editor?.getHTML() || '';
            onUpdate(content);
        },
    });

    // 에디터 내용 동기화
    useEffect(() => {
        if (editor && initialContent !== editor.getHTML()) {
            editor.commands.setContent(initialContent || '<p></p>');
        }
    }, [initialContent, editor]);

    // 에디터 정리
    useEffect(() => {
        return () => {
            if (editor) {
                editor.destroy();
            }
        };
    }, [editor]);

    const handleAddLink = useCallback(() => {
        if (editor && linkUrl) {
            editor.chain().focus().setLink({ href: linkUrl }).run();
            setLinkDialogOpen(false);
            setLinkUrl('');
        }
    }, [editor, linkUrl]);

    return {
        editor,
        linkDialogOpen,
        setLinkDialogOpen,
        linkUrl,
        setLinkUrl,
        handleAddLink,
    };
};
