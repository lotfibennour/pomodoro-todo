import React, { useMemo, useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { SearchIcon } from "lucide-react";
import { Icon } from "./Icons";
import { Task, SyncStats } from "@/types";

interface TaskTableProps {
  tasks: Task[];
  onToggleComplete: (taskId: number) => void;
  onStartPomodoro: (task: Task) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (task: Task) => void;
  accessToken: string | null;
  isSyncing: boolean;
  syncStatus: "idle" | "syncing" | "success" | "error";
  lastSync: Date | null;
  syncStats: SyncStats | null;
  onManualSync: () => void;
  onDisconnect: () => void;
  onConnectGoogle: () => void;
  canSync: boolean;
  onAddTask: () => void;
}

export const TaskTable: React.FC<TaskTableProps> = ({
  tasks,
  onToggleComplete,
  onStartPomodoro,
  onEditTask,
  onDeleteTask,
  accessToken,
  isSyncing,
  syncStatus,
  lastSync,
  onManualSync,
  onDisconnect,
  onConnectGoogle,
  canSync,
  onAddTask,
}) => {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  const getPriorityVariant = (priority: string) => {
    switch (priority) {
      case "high":
        return "destructive";
      case "medium":
        return "secondary";
      case "low":
        return "default";
      default:
        return "outline";
    }
  };

  const columns = useMemo<ColumnDef<Task>[]>(
    () => [
      {
        id: "select",
        header: "Done",
        cell: ({ row }) => (
          <input
            type="checkbox"
            checked={row.original.isComplete}
            onChange={() => onToggleComplete(row.original.id)}
            className="h-4 w-4 rounded border-primary text-primary focus:ring-primary"
          />
        ),
      },
      {
        accessorKey: "name",
        header: "Task",
        cell: ({ row }) => (
          <div
            className={`font-medium ${
              row.original.isComplete
                ? "text-muted-foreground line-through"
                : "text-foreground"
            }`}
          >
            {row.getValue("name")}
          </div>
        ),
      },
      {
        id: "pomodoros",
        header: "Pomodoros",
        cell: ({ row }) => (
          <div className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">
              {row.original.completedPomodoros}
            </span>{" "}
            / {row.original.estimatedPomodoros} 🍅
          </div>
        ),
      },
      {
        accessorKey: "priority",
        header: "Priority",
        cell: ({ row }) => (
          <Badge
            variant={getPriorityVariant(row.getValue("priority"))}
            className="capitalize"
          >
            {row.getValue("priority")}
          </Badge>
        ),
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <div className="flex justify-end gap-2">
            {!row.original.isComplete && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onStartPomodoro(row.original)}
              >
                Start
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEditTask(row.original)}
            >
              Edit
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDeleteTask(row.original)}
              className="text-muted-foreground hover:text-destructive"
            >
              <Icon name="delete" className="h-4 w-4" />
            </Button>
          </div>
        ),
      },
    ],
    [onToggleComplete, onStartPomodoro, onEditTask, onDeleteTask]
  );

  const table = useReactTable({
    data: tasks,
    columns,
    state: { sorting, columnFilters, globalFilter },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const renderSyncButton = () => {
    const iconClass = "h-4 w-4";
    let icon;
    switch (syncStatus) {
      case "syncing":
        icon = <Icon name="restart_alt" className={`${iconClass} animate-spin`} />;
        break;
      case "success":
        icon = <Icon name="check" className={`${iconClass} text-green-500`} />;
        break;
      case "error":
        icon = <Icon name="close" className={`${iconClass} text-red-500`} />;
        break;
      default:
        icon = <Icon name="restart_alt" className={iconClass} />;
    }

    return (
      <Button
        onClick={onManualSync}
        disabled={isSyncing || !canSync}
        variant="outline"
        className="flex items-center gap-2"
      >
        {icon}
        {isSyncing ? "Syncing..." : canSync ? "Sync Now" : "Wait..."}
      </Button>
    );
  };

  return (
    <>
      {/* Header + Sync Section */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-bold tracking-tight">Today&apos;s Focus</h1>
        <div className="flex items-center gap-3">
          {!accessToken ? (
            <Button onClick={onConnectGoogle} variant="outline" className="flex gap-2">
              <Icon name="waypoint" className="h-4 w-4" />
              Connect Google Tasks
            </Button>
          ) : (
            <>
              {renderSyncButton()}
              <Badge variant="secondary" className="flex items-center gap-1">
                <Icon name="check" className="h-3 w-3" />
                Connected
              </Badge>
              {lastSync && (
                <span className="text-sm text-muted-foreground">
                  Last: {lastSync.toLocaleTimeString()}
                </span>
              )}
              <Button
                onClick={onDisconnect}
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-destructive"
              >
                <Icon name="close" className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Filter + Add Button */}
      <div className="mb-4 flex justify-between">
        <div className="relative w-full max-w-sm">
          <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/70" />
          <Input
            className="pl-9"
            placeholder="Search tasks..."
            value={globalFilter ?? ""}
            onChange={(e) => setGlobalFilter(e.target.value)}
          />
        </div>
        <Button onClick={onAddTask} className="ml-4 flex items-center gap-2">
          <Icon name="add_circle" className="h-4 w-4" />
          Add Task
        </Button>
      </div>

      {/* Task Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="">
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className="h-11 px-4 text-center text-sm font-semibold text-muted-foreground"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className={` ${
                      row.original.isComplete ? "" : ""
                    }`}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="px-4 py-3 text-center">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-32 text-center text-muted-foreground"
                  >
                    No tasks found. Add a new one to get started ✨
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
};
