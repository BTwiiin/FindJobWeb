import { CalendarEvent } from "@/app/actions/calendarActions"

export const categoryOptions = [
    {
      group: "Проектирование и архитектура",
      options: [
        { value: "architectural_design", label: "Архитектурное проектирование" },
        { value: "engineering_systems", label: "Инженерные системы (электрика, сантехника, вентиляция)" },
        { value: "landscape_design", label: "Ландшафтный дизайн" },
        { value: "three_dimensional_visualization", label: "3D-визуализация и моделирование" }
      ]
    },
    {
      group: "Строительные работы",
      options: [
        { value: "general_construction", label: "Общестроительные работы" },
        { value: "renovation_and_finishing", label: "Ремонт и отделка" },
        { value: "windows_and_doors_installation", label: "Установка окон и дверей" },
        { value: "roofing_works", label: "Кровельные работы" }
      ]
    },
    {
      group: "Специализированные услуги",
      options: [
        { value: "electrical_installation", label: "Электромонтажные работы" },
        { value: "plumbing_works", label: "Сантехнические работы" },
        { value: "heating_and_air_conditioning", label: "Установка систем отопления и кондиционирования" },
        { value: "insulation_works", label: "Изоляционные работы" }
      ]
    },
    {
      group: "Управление проектами",
      options: [
        { value: "project_management_consulting", label: "Консультирование по управлению проектами" },
        { value: "network_schedule_development", label: "Разработка и оптимизация сетевых графиков" },
        { value: "risk_management", label: "Оценка рисков и управление ими" },
        { value: "work_control", label: "Контроль за выполнением работ" }
      ]
    },
    {
      group: "Оценка и экспертиза",
      options: [
        { value: "construction_cost_estimation", label: "Оценка стоимости строительства" },
        { value: "technical_expertise", label: "Техническая экспертиза объектов" },
        { value: "construction_project_audit", label: "Аудит строительных проектов" }
      ]
    },
    {
      group: "Услуги по безопасности",
      options: [
        { value: "occupational_safety_consulting", label: "Консультирование по охране труда" },
        { value: "evacuation_plan_development", label: "Разработка планов эвакуации" },
        { value: "construction_site_risk_assessment", label: "Оценка рисков на строительных площадках" }
      ]
    },
    {
      group: "Строительные материалы и оборудование",
      options: [
        { value: "construction_materials_supply", label: "Поставки строительных материалов" },
        { value: "construction_equipment_rental", label: "Аренда строительной техники" },
        { value: "materials_consulting", label: "Консультирование по выбору материалов" }
      ]
    }
  ]

  export const getEventBadgeVariant = (type: CalendarEvent["type"]) => {
    switch (type) {
      case "JOB_POST_DEADLINE":
        return "destructive"
      case "JOB_POST_START_DATE":
        return "default"
      case "JOB_POST_END_DATE":
        return "secondary"
      case "INTERVIEW":
        return "outline"
      case "MEETING":
        return "default"
      default:
        return "default"
    }
  }

  export const getEventTitle = (type: CalendarEvent["type"]) => {
    switch (type) {
      case "JOB_POST_DEADLINE":
        return "Дедлайн"
      case "JOB_POST_START_DATE":
        return "Начало работы"
      case "JOB_POST_END_DATE":
        return "Окончание работы"
      case "INTERVIEW":
        return "Собеседование"
      case "MEETING":
        return "Встреча"
      case "CUSTOM":
        return "Пользовательское"
      default:
        return type
    }
  }