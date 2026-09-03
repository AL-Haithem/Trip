import {useState, useEffect} from "react"
import {useParams, useNavigate} from "react-router"
import {brand} from "../content/siteContent.js"
import {createEmptyTour, toCreateTripPayload, DEFAULT_SERVICES, todayStr} from "../data/models.js"
import {saveTour, getTour} from "../data/tourStore.js"
import {createTrip, getTrips} from "../services/tripApi.js"
import {Input, TextArea} from "../components/ui/Input.jsx"
import Button from "../components/ui/Button.jsx"
import Chip from "../components/ui/Chip.jsx"
import Icon from "../components/ui/Icon.jsx"
import {tripForm as copy} from "../content/siteContent.js"
import {usePopup} from "../components/ui/Popup.jsx"
import "../styles/tripForm.css"

function TripForm() {
  const {id} = useParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const {showPopup} = usePopup()

  useEffect(() => {
    document.title = isEdit ? `Edit Trip - ${brand.name}` : `Create Trip - ${brand.name}`
  }, [isEdit])

  const [tour, setTour] = useState(createEmptyTour())
  const [saved, setSaved] = useState(false)

  const createDepartureDay = () => ({
    id: `day_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    date: "",
    times: [{
      id: `time_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      time: "09:00",
      seatsAvailable: 1,
      price: 0,
    }],
  })

  useEffect(() => {
    if (!id) return;
    let mounted = true;
    getTour(id).then((data) => {
      if (mounted && data) setTour({
        ...createEmptyTour(),
        ...data,
        includedServices: data.includedServices || [],
        notIncludedServices: data.notIncludedServices || [],
        departureSchedule: data.departureSchedule || [],
      });
    });
    return () => { mounted = false; };
  }, [id])

  const updateField = (field, value) => {
    setTour(prev => ({...prev, [field]: value}));
    setSaved(false);
  };

  const toggleService = (service, list) => {
    setTour(prev => {
      const otherList = list === "includedServices" ? "notIncludedServices" : "includedServices"
      if (prev[otherList].includes(service)) return prev

      const current = prev[list];
      const exists = current.includes(service);
      const next = exists
        ? current.filter(s => s !== service)
        : [...current, service];
      return {...prev, [list]: next};
    });
    setSaved(false);
  };

  const updateDepartureDay = (dayIndex, field, value) => {
    setTour(prev => {
      const schedule = [...(prev.departureSchedule || [])]
      schedule[dayIndex] = { ...schedule[dayIndex], [field]: value }
      return { ...prev, departureSchedule: schedule }
    })
    setSaved(false)
  }

  const updateDepartureTime = (dayIndex, timeIndex, field, value) => {
    setTour(prev => {
      const schedule = [...(prev.departureSchedule || [])]
      const times = [...(schedule[dayIndex]?.times || [])]
      times[timeIndex] = {
        ...times[timeIndex],
        [field]: value,
      }
      schedule[dayIndex] = { ...schedule[dayIndex], times }
      return { ...prev, departureSchedule: schedule }
    })
    setSaved(false)
  }

  const addDepartureDay = () => {
    setTour(prev => ({
      ...prev,
      departureSchedule: [...(prev.departureSchedule || []), createDepartureDay()],
    }))
    setSaved(false)
  }

  const removeDepartureDay = (dayIndex) => {
    setTour(prev => ({
      ...prev,
      departureSchedule: (prev.departureSchedule || []).filter((_, index) => index !== dayIndex),
    }))
    setSaved(false)
  }

  const addDepartureTime = (dayIndex) => {
    setTour(prev => {
      const schedule = [...(prev.departureSchedule || [])]
      schedule[dayIndex] = {
        ...schedule[dayIndex],
        times: [...(schedule[dayIndex]?.times || []), {
          id: `time_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
          time: "09:00",
          seatsAvailable: 1,
          price: 0,
        }],
      }
      return { ...prev, departureSchedule: schedule }
    })
    setSaved(false)
  }

  const removeDepartureTime = (dayIndex, timeIndex) => {
    setTour(prev => {
      const schedule = [...(prev.departureSchedule || [])]
      const times = (schedule[dayIndex]?.times || []).filter((_, idx) => idx !== timeIndex)
      schedule[dayIndex] = { ...schedule[dayIndex], times }
      return { ...prev, departureSchedule: schedule }
    })
    setSaved(false)
  }

  const handleSave = async () => {
    const payload = toCreateTripPayload(tour)

    const missingFields = []
    if (!payload.title) missingFields.push("Title")
    const schedule = tour.departureSchedule || []
    if (!schedule.length) missingFields.push("At least one departure date and time")

    schedule.forEach((day, dayIndex) => {
      if (!day.date) {
        missingFields.push(`Departure date #${dayIndex + 1}`)
      } else if (day.date < todayStr()) {
        missingFields.push(`Departure date #${dayIndex + 1} must be today or later`)
      }

      if (!(day.times || []).length) {
        missingFields.push(`At least one time for date #${dayIndex + 1}`)
      }

      ;(day.times || []).forEach((slot, timeIndex) => {
        const timeLabel = `time #${timeIndex + 1} on date #${dayIndex + 1}`
        const seats = slot.seatsAvailable
        const price = slot.price

        if (!slot.time) missingFields.push(`Time for ${timeLabel}`)
        if (seats === "" || seats === undefined || seats === null || !Number.isInteger(Number(seats)) || Number(seats) < 0) {
          missingFields.push(`Seats for ${timeLabel}`)
        }
        if (price === "" || price === undefined || price === null || !Number.isFinite(Number(price)) || Number(price) <= 0) {
          missingFields.push(`Price for ${timeLabel} must be greater than 0`)
        }
      })
    })

    if (missingFields.length) {
      showPopup(`Please complete: ${missingFields.join(", ")}`)
      return
    }

    try {
      if (!isEdit) {
        await createTrip(payload)
        await getTrips()
      } else {
        await saveTour({...payload, id: tour.id})
      }
    } catch (error) {
      const details = error.response?.data?.details
      const apiMessage = Array.isArray(details)
        ? details.map((detail) => detail.message || detail).join(", ")
        : error.response?.data?.message
      showPopup(apiMessage || error.message || "Could not save the trip.")
      return
    }

    setSaved(true);
    navigate("/trips");
  };

  return (
    <div className="tf-page">
      <div className="tf-inner">
        <button type="button" className="tf-back-btn" onClick={() => navigate("/trips")}>
          <Icon name="arrow-left" /> Back to trips
        </button>
        <h1 className="tf-title"><Icon name={isEdit ? "pen-to-square" : "plus-circle"} /> {isEdit ? copy.editTitle : copy.createTitle}</h1>

        <Input label={copy.titleLabel} required value={tour.title} onChange={(e) => updateField("title", e.target.value)} placeholder={copy.titlePlaceholder} />
        <TextArea label={copy.descriptionLabel} value={tour.description} onChange={(e) => updateField("description", e.target.value)} placeholder={copy.descriptionPlaceholder} />

        <div className="tf-schedule-block">
          <div className="tf-schedule-header">
            <label className="tf-label"><Icon name="calendar-days" /> Departure dates & times</label>
            <button type="button" className="tf-add-btn" onClick={addDepartureDay}><Icon name="plus" /> Add day</button>
          </div>

          {(tour.departureSchedule || []).map((day, dayIndex) => (
            <div key={day.id || `day_${dayIndex}`} className="tf-schedule-day">
              <div className="tf-schedule-row">
                <input
                  type="date"
                  min={todayStr()}
                  required
                  className="input"
                  value={day.date || ""}
                  onChange={(e) => updateDepartureDay(dayIndex, "date", e.target.value)}
                />
                <button type="button" className="tf-remove-btn" onClick={() => removeDepartureDay(dayIndex)}><Icon name="trash" /> Remove</button>
              </div>

              {(day.times || []).map((slot, timeIndex) => (
                <div key={slot.id || `slot_${dayIndex}_${timeIndex}`} className="tf-time-entry">
                  <div className="tf-time-row">
                    <input
                      type="time"
                      required
                      className="input"
                      value={slot.time || "09:00"}
                      onChange={(e) => updateDepartureTime(dayIndex, timeIndex, "time", e.target.value)}
                    />
                    <input
                      type="number"
                      min="0"
                      className="input"
                      required
                      value={slot.seatsAvailable ?? 0}
                      placeholder="Seats"
                      onChange={(e) => updateDepartureTime(dayIndex, timeIndex, "seatsAvailable", e.target.value)}
                    />
                    <input
                      type="number"
                      min="0"
                      className="input"
                      required
                      value={slot.price ?? 0}
                      placeholder="Price"
                      onChange={(e) => updateDepartureTime(dayIndex, timeIndex, "price", e.target.value)}
                    />
                  </div>
                  <div className="tf-time-actions">
                    <button type="button" className="tf-remove-btn" onClick={() => removeDepartureTime(dayIndex, timeIndex)}><Icon name="xmark" /> Delete</button>
                    {timeIndex === (day.times || []).length - 1 && (
                      <button type="button" className="tf-add-btn tf-add-btn-inline" onClick={() => addDepartureTime(dayIndex)}><Icon name="clock" /> Add time</button>
                    )}
                  </div>
                </div>
              ))}

              {!(day.times || []).length && (
                <button type="button" className="tf-add-btn tf-add-btn-inline" onClick={() => addDepartureTime(dayIndex)}><Icon name="clock" /> Add time</button>
              )}
            </div>
          ))}
        </div>

        <label className="tf-label">{copy.includedLabel}</label>
        <div className="tf-chips">
          {DEFAULT_SERVICES.map(service => (
            (() => {
              const active = tour.includedServices.includes(service)
              const disabled = tour.notIncludedServices.includes(service)
              return (
                <Chip
                  key={service}
                  green={active}
                  onClick={disabled ? undefined : () => toggleService(service, "includedServices")}
                  className={`tf-chip ${active ? "tf-chip-active" : ""} ${disabled ? "tf-chip-disabled" : ""}`}
                >
                  {service}
                </Chip>
              )
            })()
          ))}
        </div>

        <label className="tf-label">{copy.notIncludedLabel}</label>
        <div className="tf-chips">
          {DEFAULT_SERVICES.map(service => {
            const active = tour.notIncludedServices.includes(service)
            const disabled = tour.includedServices.includes(service)
            return (
              <Chip
                key={service}
                onClick={disabled ? undefined : () => toggleService(service, "notIncludedServices")}
                className={`tf-chip ${active ? "tf-chip-excluded" : ""} ${disabled ? "tf-chip-disabled" : ""}`}
              >
                {service}
              </Chip>
            )
          })}
        </div>

        <Button variant="primary" block onClick={handleSave} className="tf-submit">
          <Icon name={saved ? "check" : "floppy-disk"} /> {saved ? copy.saved : copy.save}
        </Button>

        {saved && (
          <p className="tf-saved">{copy.savedMessage}</p>
        )}
      </div>
    </div>
  )
}

export default TripForm
