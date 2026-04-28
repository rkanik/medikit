import type { TColors, TColorScheme } from '@/types'

import { vars } from 'nativewind'

const base = {
	light: {
		'--background': '255, 255, 255',
		'--foreground': '9, 9, 11',
		'--card': '255, 255, 255',
		'--card-foreground': '9, 9, 11',
		'--popover': '255, 255, 255',
		'--popover-foreground': '9, 9, 11',
		'--primary': '39, 204, 183',
		'--primary-foreground': '255, 255, 255',
		'--secondary': '244, 244, 246',
		'--secondary-foreground': '117, 117, 117',
		'--muted': '244, 244, 246',
		'--muted-foreground': '113, 113, 122',
		'--accent': '244, 244, 246',
		'--accent-foreground': '24, 24, 27',
		'--destructive': '239, 68, 68',
		'--destructive-foreground': '250, 250, 250',
		'--border': '230, 230, 235',
		'--input': '113, 113, 122',
		'--ring': '22, 163, 74',
		'--radius': '0.5rem',
		'--chart-1': '239, 117, 50',
		'--chart-2': '42, 157, 143',
		'--chart-3': '48, 77, 89',
		'--chart-4': '235, 198, 78',
		'--chart-5': '245, 158, 61',
	},
	dark: {
		'--background': '0, 0, 0',
		'--foreground': '255, 255, 255',
		'--card': '61, 61, 61',
		'--card-foreground': '242, 242, 242',
		'--popover': '23, 23, 23',
		'--popover-foreground': '242, 242, 242',
		'--primary': '39, 204, 183',
		'--primary-foreground': '255, 255, 255',
		'--secondary': '39, 39, 41',
		'--secondary-foreground': '189, 189, 189',
		'--muted': '38, 38, 38',
		'--muted-foreground': '156, 156, 165',
		'--accent': '41, 39, 38',
		'--accent-foreground': '250, 250, 250',
		'--destructive': '239, 68, 68',
		'--destructive-foreground': '250, 250, 250',
		'--border': '97, 97, 97',
		'--input': '97, 97, 97',
		'--ring': '19, 119, 57',
		'--chart-1': '38, 89, 191',
		'--chart-2': '46, 183, 138',
		'--chart-3': '251, 179, 55',
		'--chart-4': '157, 107, 212',
		'--chart-5': '238, 80, 131',
	},
}

export const colors = Object.keys(base).reduce<Record<TColorScheme, TColors>>(
	(colors: any, scheme: any) => {
		colors[scheme] = Object.keys((base as any)[scheme]).reduce(
			(colors: any, color: any) => {
				const key = color.replace('--', '')
				colors[key] = `rgba(${(base as any)[scheme][color]}, 1)`.replaceAll(
					' ',
					'',
				)
				return colors
			},
			{},
		)
		return colors
	},
	{} as any,
)

export const colorVars = Object.keys(base).reduce(
	(colors: any, scheme: any) => {
		colors[scheme] = vars(
			Object.keys((base as any)[scheme]).reduce((colors: any, color: any) => {
				colors[color] = `rgb(${(base as any)[scheme][color]})`.replaceAll(
					' ',
					'',
				)
				return colors
			}, {}),
		)
		return colors
	},
	{} as any,
)
