'use client'

import { useState } from 'react'
import { Plus, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface OpeningHour {
  day: string
  hours: string
}

interface OpeningHoursInputProps {
  value?: OpeningHour[]
  onChange: (value: OpeningHour[]) => void
}

const DAYS = [
  'Lundi',
  'Mardi',
  'Mercredi',
  'Jeudi',
  'Vendredi',
  'Samedi',
  'Dimanche',
]

export function OpeningHoursInput({ value = [], onChange }: OpeningHoursInputProps) {
  const [newDay, setNewDay] = useState('')
  const [newHours, setNewHours] = useState('')

  const addHours = () => {
    if (newDay && newHours) {
      onChange([...value, { day: newDay, hours: newHours }])
      setNewDay('')
      setNewHours('')
    }
  }

  const removeHours = (index: number) => {
    onChange(value.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-4">
      {/* Liste des horaires existants */}
      {value.length > 0 && (
        <div className="space-y-2">
          {value.map((item, index) => (
            <div
              key={index}
              className="flex items-center gap-3 p-3 bg-dust-grey rounded-lg border border-light-grey"
            >
              <div className="flex-1 grid grid-cols-2 gap-3">
                <div>
                  <p className="text-sm font-medium text-dark-grey">{item.day}</p>
                </div>
                <div>
                  <p className="text-sm text-dark-grey">{item.hours}</p>
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeHours(index)}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Formulaire d'ajout */}
      <div className="flex flex-wrap gap-3">
        <Select value={newDay} onValueChange={setNewDay}>
          <SelectTrigger className="flex-1">
            <SelectValue placeholder="Jour" />
          </SelectTrigger>
          <SelectContent>
            {DAYS.map((day) => (
              <SelectItem key={day} value={day}>
                {day}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Input
          placeholder="9h-18h"
          value={newHours}
          onChange={(e) => setNewHours(e.target.value)}
          className="flex-1"
        />

        <Button
          type="button"
          onClick={addHours}
          disabled={!newDay || !newHours}
          size="sm"
        >
          <Plus className="h-4 w-4 mr-1" />
          Ajouter
        </Button>
      </div>

      {value.length === 0 && (
        <p className="text-sm text-medium-grey text-center py-4 border border-dashed rounded-lg">
          Aucun horaire ajouté. Ajoutez vos horaires d'ouverture ci-dessus.
        </p>
      )}
    </div>
  )
}