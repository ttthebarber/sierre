"use client"

import * as React from "react"
import * as RechartsPrimitive from "recharts"
import { cn } from "@/lib/utils"

// ChartConfig type
type ChartConfig = {
  [k in string]: {
    label?: React.ReactNode
    icon?: React.ComponentType
  } & (
    | {
        color?: string
        theme?: never
      }
    | {
        color?: never
        theme: Record<string, string>
      }
  )
}

// Global config reference
let config: ChartConfig = {}

// ChartContainer component
const ChartContainer = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    config: ChartConfig
    children: React.ComponentProps<typeof RechartsPrimitive.ResponsiveContainer>["children"]
  }
>(({ id, className, children, config: chartConfig, ...props }, ref) => {
  const uniqueId = React.useId()
  const chartId = `chart-${id || uniqueId.replace(/:/g, "")}`
  
  // Set the config in the module scope
  config = chartConfig

  return (
    <div
      data-chart={chartId}
      ref={ref}
      className={cn(
        "flex aspect-video justify-center text-xs",
        className
      )}
      {...props}
    >
      <ChartStyle id={chartId} config={chartConfig} />
      <RechartsPrimitive.ResponsiveContainer>
        {children}
      </RechartsPrimitive.ResponsiveContainer>
    </div>
  )
})
ChartContainer.displayName = "Chart"

const ChartStyle = ({ id, config }: { id: string; config: ChartConfig }) => {
  const colorConfig = Object.entries(config).filter(
    ([_, config]) => config.theme || config.color
  )

  if (!colorConfig.length) {
    return null
  }

  return (
    <style
      dangerouslySetInnerHTML={{
        __html: `
:root {
  ${colorConfig
    .map(([key, itemConfig]) => {
      const color = itemConfig.theme?.light ?? itemConfig.color
      return color ? `  --color-${key}: ${color};` : null
    })
    .filter(Boolean)
    .join("\n")}
}

.dark {
  ${colorConfig
    .map(([key, itemConfig]) => {
      const color = itemConfig.theme?.dark ?? itemConfig.color
      return color ? `  --color-${key}: ${color};` : null
    })
    .filter(Boolean)
    .join("\n")}
}
        `,
      }}
    />
  )
}

// ChartTooltip components
const ChartTooltip = RechartsPrimitive.Tooltip

const ChartTooltipContent = React.forwardRef<
  HTMLDivElement,
  any
>(
  (
    {
      active,
      payload,
      className,
      indicator = "dot",
      hideLabel = false,
      hideIndicator = false,
      label,
      labelFormatter,
      labelClassName,
      formatter,
      color,
      nameKey,
      labelKey,
      ...props
    },
    ref
  ) => {
    if (!active || !payload?.length) {
      return null
    }

    return (
      <div
        ref={ref}
        className={cn(
          "grid min-w-[8rem] items-start gap-1.5 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs shadow-xl",
          className
        )}
        {...props}
      >
        <div className="grid gap-1.5">
          {payload.map((item: any, index: number) => {
            const indicatorColor = color || item.payload?.fill || item.color

            return (
              <div
                key={index}
                className="flex w-full items-center gap-2"
              >
                {!hideIndicator && (
                  <div
                    className="h-2.5 w-2.5 rounded-sm"
                    style={{
                      backgroundColor: indicatorColor,
                    }}
                  />
                )}
                <div className="flex flex-1 justify-between leading-none">
                  <span className="text-gray-600">
                    {item.name}
                  </span>
                  <span className="font-mono font-medium text-gray-900">
                    {item.value?.toLocaleString()}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }
)
ChartTooltipContent.displayName = "ChartTooltipContent"

// ChartLegend components
const ChartLegend = RechartsPrimitive.Legend

const ChartLegendContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    payload?: any[]
    hideIcon?: boolean
    nameKey?: string
  }
>(({ className, hideIcon = false, payload, nameKey }, ref) => {
  if (!payload?.length) {
    return null
  }

  return (
    <div
      ref={ref}
      className={cn("flex items-center justify-center gap-4", className)}
    >
      {payload.map((item: any) => (
        <div
          key={item.value}
          className="flex items-center gap-1.5"
        >
          {!hideIcon && (
            <div
              className="h-2 w-2 rounded-sm"
              style={{
                backgroundColor: item.color,
              }}
            />
          )}
          <span className="text-gray-600 text-sm">
            {item.value}
          </span>
        </div>
      ))}
    </div>
  )
})
ChartLegendContent.displayName = "ChartLegendContent"

export {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
}