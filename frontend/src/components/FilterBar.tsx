import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";

interface FilterOption {
    label: string;
    value: string;
}

interface FilterConfig {
    key: string;
    label: string;
    options: FilterOption[];
}

interface FilterBarProps {
    searchValue: string;
    onSearchChange: (value: string) => void;
    searchPlaceholder?: string;
    filters: FilterConfig[];
    filterValues: Record<string, string>;
    onFilterChange: (key: string, value: string) => void;
}

const FilterBar = ({
    searchValue,
    onSearchChange,
    searchPlaceholder = "Search...",
    filters,
    filterValues,
    onFilterChange,
}: FilterBarProps) => {
    return (
        <div className="flex flex-wrap items-center gap-3 mb-6">
            <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder={searchPlaceholder}
                    value={searchValue}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="pl-9"
                />
            </div>
            {filters.map((filter) => (
                <Select
                    key={filter.key}
                    value={filterValues[filter.key] || "all"}
                    onValueChange={(value) => onFilterChange(filter.key, value)}
                >
                    <SelectTrigger className="w-[160px]">
                        <SelectValue placeholder={filter.label} />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All {filter.label}</SelectItem>
                        {filter.options.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            ))}
        </div>
    );
};

export default FilterBar;
