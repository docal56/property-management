"use client";

import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { IconButton } from "@/components/ui/icon-button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AudioPlayer } from "@/components/composed/audio-player";
import {
  ButtonGroup,
  ButtonGroupItem,
} from "@/components/composed/button-group";
import { FormField } from "@/components/composed/form-field";
import { SectionBlock } from "@/components/composed/section-block";
import {
  SidePanel,
  SidePanelBody,
  SidePanelClose,
  SidePanelContent,
  SidePanelHeader,
} from "@/components/composed/side-panel";
import {
  TranscriptList,
  TranscriptRow,
} from "@/components/features/transcript";
import {
  IconArrowDown,
  IconArrowUp,
  IconClose,
  IconCopy,
  IconUploadMedia,
} from "@/components/ui/icons";

export type IssueStatus =
  | "new"
  | "in-progress"
  | "contractor-scheduled"
  | "awaiting-follow-up"
  | "closed";

const statusOptions: { value: IssueStatus; label: string }[] = [
  { value: "new", label: "New Issue" },
  { value: "in-progress", label: "In Progress" },
  { value: "contractor-scheduled", label: "Contractor Scheduled" },
  { value: "awaiting-follow-up", label: "Awaiting Follow up" },
  { value: "closed", label: "Closed" },
];

export interface IssueDetail {
  id: string;
  address: string;
  contactName: string;
  contactNumber: string;
  status: IssueStatus;
  contractor?: string;
  /** Free text body — extra context beyond contact details. */
  body?: ReactNode;
  audio: {
    durationLabel: string;
  };
  transcript: { speaker: "agent" | "caller"; text: string }[];
}

export interface IssueDetailPanelProps {
  issue: IssueDetail | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPrevious?: () => void;
  onNext?: () => void;
  hasPrevious?: boolean;
  hasNext?: boolean;
}

export function IssueDetailPanel({
  issue,
  open,
  onOpenChange,
  onPrevious,
  onNext,
  hasPrevious = true,
  hasNext = true,
}: IssueDetailPanelProps) {
  const [playing, setPlaying] = useState(false);

  if (!issue) return null;

  return (
    <SidePanel open={open} onOpenChange={onOpenChange}>
      <SidePanelContent width="720px">
        <SidePanelHeader
          title={issue.address}
          showCloseButton={false}
          controls={
            <>
              <ButtonGroup>
                <ButtonGroupItem
                  aria-label="Previous issue"
                  icon={<IconArrowUp />}
                  onClick={onPrevious}
                  disabled={!hasPrevious}
                />
                <ButtonGroupItem
                  aria-label="Next issue"
                  icon={<IconArrowDown />}
                  onClick={onNext}
                  disabled={!hasNext}
                />
              </ButtonGroup>
              <SidePanelClose asChild>
                <IconButton
                  variant="secondary"
                  aria-label="Close panel"
                  icon={<IconClose />}
                />
              </SidePanelClose>
            </>
          }
        />
        <SidePanelBody>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Status">
              <Select defaultValue={issue.status}>
                <SelectTrigger size="md">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>
            <FormField label="Contractor for the job">
              <Input
                size="md"
                placeholder="Add a contractor name"
                defaultValue={issue.contractor}
              />
            </FormField>
          </div>

          <SectionBlock title="Details">
            <Card className="flex flex-col gap-4">
              <div className="flex flex-col gap-2 text-base text-foreground leading-normal">
                <div>Address: {issue.address}</div>
                <div>Name: {issue.contactName}</div>
                <div>Contact Number: {issue.contactNumber}</div>
                {issue.body ? <div>{issue.body}</div> : null}
              </div>
              <div className="flex items-center justify-between">
                <Button
                  variant="secondary"
                  size="md"
                  trailingIcon={<IconUploadMedia />}
                >
                  Upload Media
                </Button>
                <Button size="md" trailingIcon={<IconCopy />}>
                  Copy Details
                </Button>
              </div>
            </Card>
          </SectionBlock>

          <SectionBlock title="Call recording">
            <AudioPlayer
              playing={playing}
              currentTime={playing ? "0:42" : "0:00"}
              duration={issue.audio.durationLabel}
              progress={playing ? 0.5 : 0}
              onPlayPauseClick={() => setPlaying((p) => !p)}
              className="px-0"
            />
          </SectionBlock>

          <SectionBlock title="Transcript">
            <TranscriptList className="border-0 p-0">
              {issue.transcript.map((row, i) => (
                <TranscriptRow key={i} speaker={row.speaker}>
                  {row.text}
                </TranscriptRow>
              ))}
            </TranscriptList>
          </SectionBlock>
        </SidePanelBody>
      </SidePanelContent>
    </SidePanel>
  );
}
