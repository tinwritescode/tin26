# AI Prompt: Build a Comprehensive Habits Statistics Page

## OVERVIEW
Create a statistics/analytics page that provides users with detailed insights into their habit tracking performance. The page should display visual data, trends, and actionable insights to help users understand their progress and maintain motivation.

## DATABASE SCHEMA (Already Exists)
The following models are already in place:
- `User`: Has `appliedTemplateId` (active template)
- `HabitTemplate`: Contains multiple habits
- `Habit`: Individual habits with icon, name, description
- `HabitCompletion`: Tracks completions with `userId`, `habitId`, `date` (YYYY-MM-DD format), `completedAt` (DateTime)

## BACKEND (tRPC Router)

Add the following procedures to `src/server/trpc/router/habits.ts`:

### 1. `getHabitStatistics`
**Purpose**: Get comprehensive statistics for all habits in the active template
**Input**: None (uses authenticated user)
**Returns**: 
```typescript
{
  totalHabits: number
  totalCompletions: number
  totalDaysTracked: number
  overallCompletionRate: number // percentage (0-100)
  currentStreak: number // consecutive days with at least one completion
  longestStreak: number
  averageCompletionsPerDay: number
  habits: Array<{
    habitId: string
    habitName: string
    habitIcon: string
    totalCompletions: number
    completionRate: number
    currentStreak: number
    longestStreak: number
    firstCompletionDate: string | null
    lastCompletionDate: string | null
  }>
}
```

### 2. `getHabitCompletionHistory`
**Purpose**: Get completion data for a specific date range
**Input**: 
```typescript
{
  startDate: string // YYYY-MM-DD
  endDate: string // YYYY-MM-DD
  habitId?: string // optional, if provided filter by specific habit
}
```
**Returns**: Array of completion records with date, habitId, habitName

### 3. `getWeeklyStats`
**Purpose**: Get weekly breakdown of completions
**Input**: 
```typescript
{
  weeks?: number // number of weeks to look back (default: 8)
}
```
**Returns**: 
```typescript
Array<{
  weekStart: string // YYYY-MM-DD (Monday)
  weekEnd: string // YYYY-MM-DD (Sunday)
  totalCompletions: number
  completionRate: number
  habitsCompleted: Array<{
    habitId: string
    habitName: string
    daysCompleted: number // 0-7
  }>
}>
```

### 4. `getMonthlyStats`
**Purpose**: Get monthly breakdown of completions
**Input**: 
```typescript
{
  months?: number // number of months to look back (default: 6)
}
```
**Returns**: 
```typescript
Array<{
  month: string // YYYY-MM
  monthName: string // "January 2024"
  totalCompletions: number
  completionRate: number
  averageCompletionsPerDay: number
  bestDay: { date: string, completions: number } | null
}>
```

### 5. `getHabitStreaks`
**Purpose**: Calculate current and longest streaks for each habit
**Input**: None
**Returns**: 
```typescript
Array<{
  habitId: string
  habitName: string
  habitIcon: string
  currentStreak: number
  longestStreak: number
  streakStartDate: string | null // if current streak exists
  lastCompletionDate: string | null
}>
```

### 6. `getCompletionCalendar`
**Purpose**: Get completion data formatted for calendar heatmap visualization
**Input**: 
```typescript
{
  year?: number // default: current year
  habitId?: string // optional filter
}
```
**Returns**: 
```typescript
{
  year: number
  data: Array<{
    date: string // YYYY-MM-DD
    completions: number
    habits: Array<{ habitId: string, habitName: string }>
  }>
}
```

## REPOSITORY METHODS

Add the following methods to `src/server/repositories/HabitCompletionRepository.ts`:

1. `getStatisticsForUser(userId: string, startDate?: string, endDate?: string): Promise<HabitStatistics>`
2. `getCompletionsByDateRange(userId: string, startDate: string, endDate: string, habitId?: string): Promise<HabitCompletion[]>`
3. `getWeeklyCompletions(userId: string, weeks: number): Promise<WeeklyStats[]>`
4. `getMonthlyCompletions(userId: string, months: number): Promise<MonthlyStats[]>`
5. `calculateStreaks(userId: string): Promise<HabitStreak[]>`
6. `getCompletionCalendar(userId: string, year: number, habitId?: string): Promise<CalendarData>`

## FRONTEND PAGE

Create `src/routes/statistics.tsx` with the following sections:

### 1. Header Section
- Page title: "Habit Statistics"
- Time period selector: "Last 7 days", "Last 30 days", "Last 90 days", "All time"
- Active template name display

### 2. Overview Cards (Top Row)
Display 4-6 key metrics in card format:
- **Total Completions**: Total number of habit completions
- **Completion Rate**: Percentage of possible completions achieved
- **Current Streak**: Consecutive days with at least one completion
- **Longest Streak**: Best streak achieved
- **Average Per Day**: Average completions per day
- **Total Days Tracked**: Number of unique days with completions

### 3. Completion Trend Chart
- Line or area chart showing completion trends over time
- X-axis: Date (days/weeks/months based on selected period)
- Y-axis: Number of completions
- Use a charting library (e.g., Recharts, Chart.js, or similar)
- Show tooltip on hover with exact values

### 4. Weekly/Monthly Breakdown
- Bar chart or table showing completions by week or month
- Include completion rate percentage for each period
- Color-code bars based on performance (green for good, yellow for medium, red for low)

### 5. Per-Habit Statistics Table
Table with columns:
- Habit (icon + name)
- Total Completions
- Completion Rate (%)
- Current Streak
- Longest Streak
- First Completion
- Last Completion
- Actions (view details button)

### 6. Calendar Heatmap
- GitHub-style contribution calendar
- Each day shows as a square
- Color intensity based on number of completions that day
- Hover shows date and completions
- Click to view details for that day

### 7. Top/Bottom Performers
- **Best Performing Habits**: Top 3-5 habits by completion rate
- **Needs Attention**: Habits with lowest completion rates or longest gaps

### 8. Insights Section
Display actionable insights such as:
- "You've completed X habits Y days in a row! Keep it up!"
- "Your best day was [date] with [X] completions"
- "You haven't completed [habit name] in [X] days"
- "Your completion rate improved [X]% this week compared to last week"

## UI/UX REQUIREMENTS

### Design
- Follow existing design patterns from `habits.tsx` and `templates.tsx`
- Use Tailwind CSS classes matching the current color scheme:
  - Background: `bg-[#F0F2F5]`
  - Cards: `bg-white rounded-lg shadow-sm border border-[#CCD0D5]`
  - Text: `text-[#050505]` for headings, `text-[#65676B]` for secondary text
  - Primary actions: `bg-blue-600 text-white hover:bg-blue-700`
- Use lucide-react icons (e.g., `TrendingUp`, `Calendar`, `BarChart3`, `Target`, `Award`)

### Responsive Design
- Mobile: Stack cards vertically, simplify charts
- Tablet: 2-column layout for cards
- Desktop: Full layout with all sections visible

### Loading States
- Show skeleton loaders or loading spinners while fetching data
- Use `isLoading` states from tRPC queries

### Empty States
- If user has no active template: Show message with link to templates page
- If user has no completions yet: Show encouraging message to start tracking

### Error Handling
- Display user-friendly error messages
- Handle cases where user has no completions gracefully

## TECHNICAL IMPLEMENTATION

### Routing
- Create file: `src/routes/statistics.tsx`
- Use TanStack Router: `createFileRoute('/statistics')`
- Add "Statistics" menu item to `Sidebar.tsx` with appropriate icon (e.g., `BarChart3` from lucide-react)

### Data Fetching
- Use tRPC hooks: `trpc.habits.getHabitStatistics.useQuery()`
- Implement proper query invalidation when habits are completed
- Consider using React Query's `useQuery` options for caching and refetching

### Chart Library
- Recommended: Recharts (lightweight, React-friendly)
- Alternative: Chart.js with react-chartjs-2
- Ensure charts are responsive and accessible

### Date Handling
- Use date-fns or similar for date formatting and calculations
- All dates should be in YYYY-MM-DD format for consistency
- Handle timezone considerations (use UTC or user's local timezone consistently)

### Performance
- Implement pagination or virtualization for large datasets
- Use memoization for expensive calculations (useMemo, useCallback)
- Lazy load chart components if needed

## EXAMPLE CALCULATIONS

### Completion Rate
```
completionRate = (totalCompletions / (totalHabits * totalDaysTracked)) * 100
```

### Current Streak
- Start from today and count backwards
- A day counts if it has at least one completion
- Stop when a day with zero completions is found

### Longest Streak
- Find all consecutive day sequences with at least one completion
- Return the length of the longest sequence

## TESTING CONSIDERATIONS

- Test with users who have no completions
- Test with users who have many completions
- Test edge cases: single day, single habit, etc.
- Test date range selections
- Verify streak calculations are correct
- Test calendar heatmap with sparse data

## FUTURE ENHANCEMENTS (Optional)

- Export statistics as CSV/PDF
- Set goals and track progress toward them
- Compare statistics across different templates
- Social features: share achievements
- Habit recommendations based on patterns
- Predictive analytics (e.g., "You're on track to complete X habits this month")
