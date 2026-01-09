
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export type LibraryItemType = 'video' | 'survey' | 'document';

export interface AssignedLibraryItem {
    id: string;
    item_id: string;
    type: LibraryItemType;
    title: string;
    description: string | null;
    assigned_at: string;
    // Specific fields
    video_id?: string;
    youtube_video_id?: string;
    youtube_url?: string;
    survey_id?: string;
    document_id?: string;
    file_url?: string;
    file_name?: string;
}

export const useAssignedLibraryItems = () => {
    const { user } = useAuth();
    const [items, setItems] = useState<AssignedLibraryItem[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchAssignedItems = useCallback(async () => {
        if (!user?.id) return;

        setLoading(true);
        try {
            const [videosRes, surveysRes, docsRes] = await Promise.all([
                supabase
                    .from('library_video_assignments')
                    .select(`
            id,
            assigned_at,
            video:video_id (
              id,
              title,
              description,
              youtube_video_id,
              youtube_url
            )
          `)
                    .or(`user_id.eq.${user.id},assignment_type.eq.all_clients`),
                supabase
                    .from('library_survey_assignments')
                    .select(`
            id,
            assigned_at,
            survey:survey_id (
              id,
              title,
              description
            )
          `)
                    .or(`user_id.eq.${user.id},assignment_type.eq.all_clients`),
                supabase
                    .from('library_document_assignments')
                    .select(`
            id,
            assigned_at,
            document:document_id (
              id,
              title,
              description,
              file_url,
              file_name
            )
          `)
                    .or(`user_id.eq.${user.id},assignment_type.eq.all_clients`)
            ]);

            const consolidatedItems: AssignedLibraryItem[] = [];

            // Process Videos
            if (videosRes.data) {
                videosRes.data.forEach((item: any) => {
                    if (item.video) {
                        consolidatedItems.push({
                            id: item.id,
                            item_id: item.video.id,
                            type: 'video',
                            title: item.video.title,
                            description: item.video.description,
                            assigned_at: item.assigned_at,
                            youtube_video_id: item.video.youtube_video_id,
                            youtube_url: item.video.youtube_url
                        });
                    }
                });
            }

            // Process Surveys
            if (surveysRes.data) {
                surveysRes.data.forEach((item: any) => {
                    if (item.survey) {
                        consolidatedItems.push({
                            id: item.id,
                            item_id: item.survey.id,
                            type: 'survey',
                            title: item.survey.title,
                            description: item.survey.description,
                            assigned_at: item.assigned_at,
                            survey_id: item.survey.id
                        });
                    }
                });
            }

            // Process Documents
            if (docsRes.data) {
                docsRes.data.forEach((item: any) => {
                    if (item.document) {
                        consolidatedItems.push({
                            id: item.id,
                            item_id: item.document.id,
                            type: 'document',
                            title: item.document.title,
                            description: item.document.description,
                            assigned_at: item.assigned_at,
                            document_id: item.document.id,
                            file_url: item.document.file_url,
                            file_name: item.document.file_name
                        });
                    }
                });
            }

            // Sort by assigned_at descending
            consolidatedItems.sort((a, b) =>
                new Date(b.assigned_at).getTime() - new Date(a.assigned_at).getTime()
            );

            setItems(consolidatedItems);
        } catch (error) {
            console.error("Error fetching assigned library items:", error);
        } finally {
            setLoading(false);
        }
    }, [user?.id]);

    useEffect(() => {
        fetchAssignedItems();
    }, [fetchAssignedItems]);

    return { items, loading, refetch: fetchAssignedItems };
};
export default useAssignedLibraryItems;
