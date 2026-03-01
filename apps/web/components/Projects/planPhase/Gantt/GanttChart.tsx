"use client";
import { Button } from "@/components/ui/button";
import {
  addMonths,
  addYears,
  eachDayOfInterval,
  eachMonthOfInterval,
  endOfMonth,
  endOfYear,
  format,
  isSameMonth,
  isSameYear,
  isWithinInterval,
  parseISO,
  startOfMonth,
  startOfYear,
  subMonths,
  subYears,
} from "date-fns";
import { Calendar } from "lucide-react";
import { useState } from "react";
import { LuChevronLeft, LuChevronRight } from "react-icons/lu";

export default function GanttChart({ data }: any) {
  const [viewType, setViewType] = useState("month");
  const [currentDate, setCurrentDate] = useState(new Date());

  const handlePrev = () => {
    if (viewType === "month") {
      setCurrentDate(subMonths(currentDate, 1));
    } else {
      setCurrentDate(subYears(currentDate, 1));
    }
  };

  const handleNext = () => {
    if (viewType === "month") {
      setCurrentDate(addMonths(currentDate, 1));
    } else {
      setCurrentDate(addYears(currentDate, 1));
    }
  };
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const yearStart = startOfYear(currentDate);
  const yearEnd = endOfYear(currentDate);

  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const monthsInYear = eachMonthOfInterval({ start: yearStart, end: yearEnd });

  const getProgressColor = (progress: number) => {
    if (progress >= 100) return "bg-green-500";
    if (progress >= 50) return "bg-yellow-500";
    return "bg-red-500";
  };

  const isDateInPlan = (date: Date, startDate: Date, endDate: Date) => {
    return isWithinInterval(date, { start: startDate, end: endDate });
  };

  const isMonthInPlan = (month: Date, startDate: Date, endDate: Date) => {
    const monthStart = startOfMonth(month);
    const monthEnd = endOfMonth(month);
    return (
      isWithinInterval(monthStart, { start: startDate, end: endDate }) ||
      isWithinInterval(monthEnd, { start: startDate, end: endDate }) ||
      isWithinInterval(startDate, { start: monthStart, end: monthEnd })
    );
  };

  return (
    <div className="w-full mb-6">
      <div className="flex flex-col md:flex-row items-center w-full justify-between mb-6">
        <h2 className="text-md font-bold">{data[0]?.plan_name}</h2>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              className="flex items-center gap-2"
              onClick={() =>
                setViewType(viewType === "month" ? "year" : "month")
              }
            >
              <Calendar className="h-5 w-5" />
              {viewType === "month"
                ? "Switch to Year View"
                : "Switch to Month View"}
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" className="border-0" onClick={handlePrev}>
              <LuChevronLeft className="h-5 w-5" />
            </Button>
            <span>
              {viewType === "month"
                ? format(currentDate, "MMMM yyyy")
                : format(currentDate, "yyyy")}
            </span>
            <Button variant="outline" className="border-0" onClick={handleNext}>
              <LuChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-[150px_1fr] md:grid-cols-[300px_1fr] gap-6">
        <div className="overflow-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Phase
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dates
                </th>
                {/* <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Progress
                </th> */}
              </tr>
            </thead>
            <tbody className=" divide-y divide-gray-200">
              {data.map((item: any) => (
                <tr key={item.plan_phase_id}>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.plan_phase_name}
                    <br />
                    {item.progress_percent} {item.progress_percent && "%"}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.plan_start_date}
                    <br />
                    {item.plan_end_date}
                  </td>
                  {/* <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.progress_percent}
                  </td> */}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="overflow-auto">
          <div className="min-w-full">
            {viewType === "month" ? (
              <>
                <div className="grid grid-cols-[repeat(31,minmax(30px,1fr))] border-b border-gray-200">
                  {daysInMonth.map((day: any, index) => (
                    <div
                      key={day.toString()}
                      className="text-center text-xs text-gray-600 py-2 border-r border-gray-200 last:border-r-0"
                    >
                      {/* {index % 2 === 0 && ( */}
                      <>
                        <div className="font-medium">{format(day, "dd")}</div>
                        {/* <div className="text-gray-500">
                          {format(day, "MMM")}
                        </div> */}
                      </>
                      {/* )} */}
                    </div>
                  ))}
                </div>
                <div className="relative">
                  {data.map((item: any) => {
                    const startDate = parseISO(item.plan_start_date);
                    const endDate = parseISO(item.plan_end_date);
                    const shouldShowPlan =
                      isSameMonth(startDate, currentDate) ||
                      isSameMonth(endDate, currentDate) ||
                      (currentDate > startDate && currentDate < endDate);
                    return (
                      <div
                        key={item.plan_phase_id}
                        className="grid grid-cols-[repeat(31,minmax(30px,1fr))] border-b border-gray-200"
                      >
                        {daysInMonth.map((day) => (
                          <div
                            key={day.toString()}
                            className={`h-8 border-r border-b border-gray-200 last:border-r-0 ${
                              isDateInPlan(day, startDate, endDate) &&
                              shouldShowPlan
                                ? getProgressColor(item.progress_percent)
                                : ""
                            }`}
                          />
                        ))}
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <>
                <div className="grid grid-cols-12 border-b border-gray-200">
                  {monthsInYear.map((month) => (
                    <div
                      key={month.toString()}
                      className="text-center text-sm text-gray-600 py-2 border-r border-gray-200 last:border-r-0"
                    >
                      {format(month, "MMM")}
                    </div>
                  ))}
                </div>

                {/* Year View Gantt rows */}
                <div className="relative">
                  {data.map((phase: any) => {
                    const startDate = parseISO(phase.plan_start_date);
                    const endDate = parseISO(phase.plan_end_date);
                    const shouldShowPlan =
                      isSameYear(currentDate, startDate) ||
                      isSameYear(currentDate, endDate) ||
                      (currentDate > startDate && currentDate < endDate);

                    return (
                      <div
                        key={phase.plan_phase_id}
                        className="grid grid-cols-12 border-b border-gray-200"
                      >
                        {monthsInYear.map((month) => (
                          <div
                            key={month.toString()}
                            className={`h-8 border-r  border-gray-200 last:border-r-0 ${
                              isMonthInPlan(month, startDate, endDate) &&
                              shouldShowPlan
                                ? getProgressColor(phase.progress_percent)
                                : ""
                            }`}
                          />
                        ))}
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      {/* Legend */}
      <div className="mt-6 flex gap-6 justify-end">
        <div className="flex items-center gap-2">
          <div className="w-6 h-4 md:w-4 md:h-4 bg-green-500 rounded" />
          <span className="text-sm text-gray-600">Completed on time</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-4 md:w-4 md:h-4 bg-yellow-500 rounded" />
          <span className="text-sm text-gray-600">Completed with delay</span>
        </div>
        <div className="flex items-center gap-2 ">
          <div className="w-4 h-4 md:w-4 md:h-4 bg-red-500 rounded" />
          <span className="text-sm text-gray-600 md:block hidden">
            Delayed or started late
          </span>
          <span className="text-sm md:hidden text-gray-600">Delayed</span>
        </div>
      </div>
    </div>
  );
}
