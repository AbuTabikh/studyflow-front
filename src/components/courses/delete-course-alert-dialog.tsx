"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogMedia,
  AlertDialogFooter,
} from "@/components/ui/alert-dialog";
import { Course } from "@/types/course";
import { Trash2Icon } from "lucide-react";
import { useTranslation } from "@/lib/i18n/use-translation";

interface DeleteCourseAlertDialogProps {
  isOpen: boolean;
  course: Course | null;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function DeleteCourseAlertDialog({
  isOpen,
  course,
  onConfirm,
  onCancel,
  isLoading = false,
}: DeleteCourseAlertDialogProps) {
  const { tr, t } = useTranslation();
  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
      <AlertDialogContent>
        <AlertDialogHeader className="flex flex-col  ">
          <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive">
            <Trash2Icon />
          </AlertDialogMedia>
          <AlertDialogTitle>{tr(t.courses.deleteCourseTitle)}</AlertDialogTitle>
          <AlertDialogDescription>
            {course && (
              <>
                {tr(t.courses.deleteCourseConfirm)} <strong>{course.title}</strong>?
                <br />
                {tr(t.common.cannotUndo)}
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading} variant="outline">
            {tr(t.actions.cancel)}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isLoading}
            variant="destructive"
          >
            {isLoading ? tr(t.courses.deleting) : tr(t.actions.delete)}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
