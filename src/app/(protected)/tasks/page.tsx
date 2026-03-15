"use client";

/**
 * @fileoverview Tasks page.
 * Kanban-style task list with mock data.
 */

import { CheckSquare, Plus, Clock, AlertCircle, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const MOCK_TASKS = [
  { id: 1, title: "Set up user onboarding flow", priority: "High", assignee: "Alice M", due: "Mar 18", status: "In Progress" },
  { id: 2, title: "Review audit trail implementation", priority: "Medium", assignee: "Bob K", due: "Mar 20", status: "Todo" },
  { id: 3, title: "Design permission matrix", priority: "High", assignee: "Carol S", due: "Mar 17", status: "Done" },
  { id: 4, title: "Prepare client demo", priority: "Low", assignee: "Dave R", due: "Mar 25", status: "Todo" },
  { id: 5, title: "Write API documentation", priority: "Medium", assignee: "Eve T", due: "Mar 22", status: "In Progress" },
];

const PRIORITY_COLORS: Record<string, string> = {
  High: "bg-red-100 text-red-700",
  Medium: "bg-amber-100 text-amber-700",
  Low: "bg-green-100 text-green-700",
};

const STATUS_ICONS: Record<string, React.ReactNode> = {
  Todo: <Clock size={14} className="text-muted-foreground" />,
  "In Progress": <AlertCircle size={14} className="text-blue-500" />,
  Done: <CheckCircle2 size={14} className="text-green-500" />,
};

export default function TasksPage() {
  const groups = ["Todo", "In Progress", "Done"] as const;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <CheckSquare size={20} className="text-primary" /> Tasks
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">Track team work items and assignments</p>
        </div>
        <Button className="gradient-obliq border-0 text-white hover:opacity-90 shadow-sm shadow-orange-100">
          <Plus size={16} className="mr-1.5" /> New Task
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {groups.map((group) => {
          const tasks = MOCK_TASKS.filter((t) => t.status === group);
          return (
            <div key={group} className="space-y-3">
              <div className="flex items-center gap-2 px-1">
                {STATUS_ICONS[group]}
                <span className="text-sm font-semibold">{group}</span>
                <Badge variant="secondary" className="ml-auto text-xs">{tasks.length}</Badge>
              </div>
              {tasks.map((task) => (
                <Card key={task.id} className="border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-4">
                    <p className="text-sm font-medium mb-3 leading-snug">{task.title}</p>
                    <div className="flex items-center justify-between">
                      <Badge className={`text-xs border-0 ${PRIORITY_COLORS[task.priority]}`}>
                        {task.priority}
                      </Badge>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs text-muted-foreground">{task.due}</span>
                        <Avatar className="h-5 w-5">
                          <AvatarFallback className="text-[9px] gradient-obliq text-white">
                            {task.assignee.split(" ").map((n) => n[0]).join("")}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              <button className="w-full text-sm text-muted-foreground hover:text-primary flex items-center gap-1.5 px-2 py-2 rounded-lg hover:bg-accent transition-colors">
                <Plus size={14} /> Add task
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
