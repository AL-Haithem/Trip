import {useEffect, useMemo, useState} from "react"
import {useNavigate, useParams} from "react-router"

import {getTrip} from "../services/tripApi.js"
import {brand} from "../content/siteContent.js"
import {Input, TextArea} from "../components/ui/Input.jsx"
import Button from "../components/ui/Button.jsx"
import Chip from "../components/ui/Chip.jsx"
import Icon from "../components/ui/Icon.jsx"
import "../styles/booking.css"

const formatDate = (dateStr) =>
  new Date(`${dateStr}T00:00:00`).toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  })

function BookingPage() {  useEffect(() => {
    document.title = `Book Trip - ${brand.name}`
  }, [])
  const {id} = useParams()
  const navigate = useNavigate()

  const [tour, setTour] = useState(null)
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [phone, setPhone] = useState("")
  const [email, setEmail] = useState("")
  const [guests, setGuests] = useState(1)
  const [selectedDate, setSelectedDate] = useState("")
  const [selectedTime, setSelectedTime] = useState("")
  const [notes, setNotes] = useState("")
  const [paymentMethod, setPaymentMethod] = useState("edahabia")
  const [submitMessage, setSubmitMessage] = useState("")

  useEffect(() => {
    let mounted = true

    getTrip(id).then((data) => {
      if (mounted && data) {
        setTour(data)
        const schedule = (data.departureSchedule || []).filter((day) => day && day.date)
        if (schedule.length) {
          const firstDate = schedule[0].date
          const firstTime = (schedule[0].times || []).find((slot) => slot && slot.time)?.time || ""
          setSelectedDate(firstDate)
          setSelectedTime(firstTime)
        }
      }
    })

    return () => { mounted = false }
  }, [id])

  const schedule = useMemo(() => {
    return (tour?.departureSchedule || [])
      .filter((day) => day && day.date)
      .sort((a, b) => new Date(a.date) - new Date(b.date))
  }, [tour])

  const availableTimesForSelectedDate = useMemo(() => {
    const day = schedule.find((item) => item.date === selectedDate)
    return (day?.times || []).filter((slot) => slot && slot.time)
  }, [schedule, selectedDate])

  useEffect(() => {
    if (!availableTimesForSelectedDate.length) {
      setSelectedTime("")
      return
    }

    const currentTimeExists = availableTimesForSelectedDate.some((slot) => slot.time === selectedTime)
    if (!currentTimeExists) {
      setSelectedTime(availableTimesForSelectedDate[0].time)
    }
  }, [availableTimesForSelectedDate, selectedTime])

  const selectedSlot = useMemo(() => {
    return availableTimesForSelectedDate.find((slot) => slot.time === selectedTime) ||
      availableTimesForSelectedDate[0] || null
  }, [availableTimesForSelectedDate, selectedTime])

  const remainingSeats = Number(selectedSlot?.seatsAvailable || 0)

  useEffect(() => {
    if (remainingSeats <= 0) {
      setGuests(0)
      return
    }
    setGuests((value) => Math.min(Math.max(1, value), remainingSeats))
  }, [remainingSeats])

  const totalPrice = useMemo(() => {
    if (!tour || !selectedSlot) return 0
    return Number(selectedSlot.price || 0) * guests
  }, [tour, selectedSlot, guests])

  const grandTotal = totalPrice

  const handleSubmit = () => {
    if (!firstName.trim() || !lastName.trim() || !phone.trim() || !email.trim()) {
      setSubmitMessage("Please fill in your full booking information.")
      return
    }

    if (!selectedDate || !selectedTime || !selectedSlot) {
      setSubmitMessage("Please choose a valid departure date and time.")
      return
    }

    if (guests < 1 || guests > remainingSeats) {
      setSubmitMessage(`You can reserve between 1 and ${remainingSeats} seats for this departure time.`)
      return
    }

    setSubmitMessage(`Booking request sent for ${firstName} ${lastName} — ${guests} seat(s) on ${selectedDate} at ${selectedTime}. Redirecting to the ${paymentMethod === "edahabia" ? "Edahabia" : paymentMethod === "visa" ? "Visa" : "Mastercard"} payment page, total ${grandTotal.toLocaleString()} $.`)
  }

  if (!tour) {
    return <div className="bk-loading"><span className="spinner" /> Loading booking details…</div>
  }

  return (
    <div className="bk-page">
      <div className="bk-inner">
        <section className="bk-panel">
          {/* ═══ Head ═══ */}
          <div className="bk-form-head">
            <div className="bk-head-main">
              <button className="bk-back" type="button" onClick={() => navigate(-1)}>
                <Icon name="arrow-left" /> Back
              </button>

              <div className="bk-title-stack">
                <h2><Icon name="calendar-check" /> Book now</h2>
              </div>
            </div>

            <div className="bk-price-tag"><Icon name="tag" /> {totalPrice.toLocaleString()} $</div>
          </div>

          <div className="bk-hero">
            <h1 className="bk-title">{tour.title}</h1>
            <p className="bk-desc">
              {tour.description || "A handcrafted journey designed for travelers who want comfort, beauty, and unforgettable moments."}
            </p>
          </div>

          <div className="bk-meta">
            <div className="bk-meta-item">
              <Icon name="dollar-sign" />
              <span>Price</span>
              <strong>{Number(selectedSlot?.price || 0).toLocaleString()} $</strong>
            </div>
            <div className="bk-meta-item">
              <Icon name="users" />
              <span>Seats left</span>
              <strong>{remainingSeats || 0}</strong>
            </div>
            <div className="bk-meta-item">
              <Icon name="route" />
              <span>Distance</span>
              <strong>{tour.distanceKm || 0} km</strong>
            </div>
          </div>

          {/* ═══ Two columns: form | summary ═══ */}
          <div className="bk-columns">
            <div className="bk-col">
              <div className="bk-form-grid">
                <Input label="First name" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                <Input label="Last name" value={lastName} onChange={(e) => setLastName(e.target.value)} />
              </div>

              <div className="bk-form-grid">
                <Input label="Phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+213 …" />
                <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
              </div>

              <div className="bk-form-grid">
                <div className="field">
                  <label>Seats</label>
                  <div className="bk-stepper">
                    <button type="button" onClick={() => setGuests((v) => Math.max(1, v - 1))}><Icon name="minus" /></button>
                    <span>{guests}</span>
                    <button type="button" onClick={() => setGuests((v) => Math.min(remainingSeats || 1, v + 1))}><Icon name="plus" /></button>
                  </div>
                </div>

                <div className="field">
                  <label>Departure</label>
                  <div className="bk-selected-departure">
                    <Icon name="calendar-days" />
                    <span>{selectedDate ? formatDate(selectedDate) : "No date"}</span>
                    <strong>{selectedTime || "No time"}</strong>
                  </div>
                </div>
              </div>

              <div className="bk-block">
                <h3 className="bk-block-title"><Icon name="calendar-days" /> Departure options</h3>
                {schedule.length ? (
                  <div className="bk-days">
                    {schedule.map((day) => (
                      <div key={day.id || day.date} className="bk-day">
                        <strong className="bk-day-date">{formatDate(day.date)}</strong>
                        <div className="bk-day-times">
                          {(day.times || []).map((slot) => {
                            const active = selectedDate === day.date && selectedTime === slot.time
                            return (
                              <button
                                key={slot.id || `${day.date}-${slot.time}`}
                                type="button"
                                className={active ? "bk-time active" : "bk-time"}
                                onClick={() => {
                                  setSelectedDate(day.date)
                                  setSelectedTime(slot.time)
                                }}
                              >
                                {slot.time} · {Number(slot.seatsAvailable || 0)} seats
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="bk-empty">No departure schedule available yet.</p>
                )}
              </div>

              <TextArea
                label="Notes"
                rows={2}
                placeholder="Any preferences or special requests?"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            <div className="bk-col">
              <div className="bk-total">
                <span><Icon name="receipt" /> Total price</span>
                <strong>{grandTotal.toLocaleString()} $</strong>
              </div>

              <div className="bk-payment">
                <h3 className="bk-block-title"><Icon name="wallet" /> Payment</h3>
                <div className="bk-pay-methods">
                  {[
                    {id: "edahabia", label: "الذهبية - Edahabia", icon: "wallet"},
                    {id: "visa", label: "Visa", icon: "credit-card"},
                    {id: "mastercard", label: "Mastercard", icon: "money-check"},
                  ].map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      className={paymentMethod === m.id ? "bk-pay-method active" : "bk-pay-method"}
                      onClick={() => setPaymentMethod(m.id)}
                    >
                      <Icon name={m.icon} />
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bk-block">
                <h3 className="bk-block-title"><Icon name="circle-check" /> Included</h3>
                <div className="bk-chips">
                  {(tour.includedServices && tour.includedServices.length > 0 ? tour.includedServices : ["Food", "Transport", "City guide"]).map((service) => (
                    <Chip key={service} green>{service}</Chip>
                  ))}
                </div>
              </div>

              {submitMessage && <div className="bk-message">{submitMessage}</div>}

              <div className="bk-cta">
                <Button variant="primary" size="lg" block onClick={handleSubmit}>
                  <Icon name="sparkles" /> Book Now <Icon name="arrow-right" />
                </Button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

export default BookingPage
