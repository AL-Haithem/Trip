import { useEffect, useMemo, useState } from "react"
import { useNavigate, useParams } from "react-router"
import { getTour } from "../data/tourStore.js"

function BookingPage() {
  const { id } = useParams()
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
  const [paymentMethod, setPaymentMethod] = useState("card")
  const [cardName, setCardName] = useState("")
  const [cardNumber, setCardNumber] = useState("")
  const [cardExpiry, setCardExpiry] = useState("")
  const [cardCvc, setCardCvc] = useState("")
  const [submitMessage, setSubmitMessage] = useState("")

  useEffect(() => {
    let mounted = true

    getTour(id).then((data) => {
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

    return () => {
      mounted = false
    }
  }, [id])

  const schedule = useMemo(() => {
    return (tour?.departureSchedule || []).filter((day) => day && day.date).sort((a, b) => new Date(a.date) - new Date(b.date))
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
    return availableTimesForSelectedDate.find((slot) => slot.time === selectedTime) || availableTimesForSelectedDate[0] || null
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

  // تفاصيل الدفع | رسوم الخدمة 5% + ضريبة 19% //
  const SERVICE_FEE_RATE = 0.05
  const VAT_RATE = 0.19
  const serviceFee = Math.round(totalPrice * SERVICE_FEE_RATE * 100) / 100
  const vat = Math.round((totalPrice + serviceFee) * VAT_RATE * 100) / 100
  const grandTotal = totalPrice + serviceFee + vat

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

    if (paymentMethod === "card" && (!cardName.trim() || cardNumber.replace(/\D/g, "").length < 12 || !cardExpiry.trim() || cardCvc.length < 3)) {
      setSubmitMessage("Please complete the card details to proceed with the payment.")
      return
    }

    const payLabel = paymentMethod === "card" ? "paid by card" : paymentMethod === "cash" ? "cash on departure" : "bank transfer"
    setSubmitMessage(`Booking request sent for ${firstName} ${lastName} — ${guests} seat(s) on ${selectedDate} at ${selectedTime}, ${payLabel}, total ${grandTotal.toLocaleString()} $.`)
  }

  if (!tour) {
    return <div className="booking-loading">Loading booking details...</div>
  }

  return (
    <div className="booking-page">
      <div className="booking-shell">
        <button className="booking-back" type="button" onClick={() => navigate(-1)}>
          ← Back
        </button>

        <div className="booking-grid">
          <section className="booking-hero">
            <div className="booking-badge">Luxury travel</div>
            <h1>{tour.title}</h1>
            <p>{tour.description || "A handcrafted journey designed for travelers who want comfort, beauty, and unforgettable moments."}</p>

            <div className="booking-meta">
              <div>
                <span>Price</span>
                <strong>{Number(selectedSlot?.price || 0).toLocaleString()} $</strong>
              </div>
              <div>
                <span>Seats left</span>
                <strong>{remainingSeats || 0}</strong>
              </div>
              <div>
                <span>Distance</span>
                <strong>{tour.distanceKm || 0} km</strong>
              </div>
            </div>

            <div className="booking-card">
              <h3>Included in your trip</h3>
              <ul>
                {(tour.includedServices && tour.includedServices.length > 0 ? tour.includedServices : ["Food", "Transport", "City guide"]).map((service) => (
                  <li key={service}>{service}</li>
                ))}
              </ul>
            </div>

            <div className="booking-card booking-card-alt">
              <h3>Departure options</h3>
              {schedule.length ? (
                <div className="booking-days-list">
                  {schedule.map((day) => (
                    <div key={day.id || day.date} className="booking-day-box">
                      <strong>{new Date(`${day.date}T00:00:00`).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}</strong>
                      <div className="booking-times-list">
                        {(day.times || []).map((slot) => (
                          <span key={slot.id || `${day.date}-${slot.time}`} className={selectedDate === day.date && selectedTime === slot.time ? "active" : ""}>
                            {slot.time} · {Number(slot.seatsAvailable || 0)} seats
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="booking-empty">No departure schedule available yet.</p>
              )}
            </div>
          </section>

          <section className="booking-form-panel">
            <div className="booking-form-head">
              <div>
                <span className="booking-kicker">Secure booking</span>
                <h2>Book now</h2>
              </div>
              <div className="booking-price-tag">{totalPrice.toLocaleString()} $</div>
            </div>

            <div className="booking-form-grid">
              <div className="booking-field-group">
                <label htmlFor="booking-first-name">First name</label>
                <input id="booking-first-name" type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="" />
              </div>

              <div className="booking-field-group">
                <label htmlFor="booking-last-name">Last name</label>
                <input id="booking-last-name" type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="" />
              </div>
            </div>

            <div className="booking-form-grid">
              <div className="booking-field-group">
                <label htmlFor="booking-phone">Phone</label>
                <input id="booking-phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+213 ..." />
              </div>

              <div className="booking-field-group">
                <label htmlFor="booking-email">Email</label>
                <input id="booking-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
              </div>
            </div>

            <div className="booking-field-group">
              <label>Seats</label>
              <div className="booking-stepper">
                <button type="button" onClick={() => setGuests((v) => Math.max(1, v - 1))}>−</button>
                <span>{guests}</span>
                <button type="button" onClick={() => setGuests((v) => Math.min(remainingSeats || 1, v + 1))}>+</button>
              </div>
            </div>

            <div className="booking-field-group">
              <label htmlFor="booking-date">Departure date</label>
              <select id="booking-date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)}>
                {schedule.length ? schedule.map((day) => (
                  <option key={day.id || day.date} value={day.date}>{new Date(`${day.date}T00:00:00`).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}</option>
                )) : <option value="">No dates</option>}
              </select>
            </div>

            <div className="booking-field-group">
              <label htmlFor="booking-time">Departure time</label>
              <select id="booking-time" value={selectedTime} onChange={(e) => setSelectedTime(e.target.value)}>
                {availableTimesForSelectedDate.length ? availableTimesForSelectedDate.map((slot) => (
                  <option key={slot.id || `${selectedDate}-${slot.time}`} value={slot.time}>{slot.time}</option>
                )) : <option value="">No time</option>}
              </select>
            </div>

            <div className="booking-field-group">
              <label htmlFor="booking-notes">Notes</label>
              <textarea
                id="booking-notes"
                rows={4}
                placeholder="Any preferences, travel requests, or accommodation notes?"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            <div className="booking-final-summary">
              <div className="booking-summary-header">
                <span>Final booking details</span>
                <strong>{grandTotal.toLocaleString()} $</strong>
              </div>

              <div className="booking-summary">
                <div><span>Trip</span><strong>{tour.title}</strong></div>
                <div><span>Seats</span><strong>{guests}</strong></div>
                <div><span>Date</span><strong>{selectedDate}</strong></div>
                <div><span>Time</span><strong>{selectedTime}</strong></div>
                <div><span>Unit Price</span><strong>{Number(selectedSlot?.price || 0).toLocaleString()} $</strong></div>
                <div><span>Subtotal</span><strong>{totalPrice.toLocaleString()} $</strong></div>
                <div><span>Service fee (5%)</span><strong>{serviceFee.toLocaleString()} $</strong></div>
                <div><span>VAT (19%)</span><strong>{vat.toLocaleString()} $</strong></div>
                <div><span>Available</span><strong>{remainingSeats} seats</strong></div>
              </div>
            </div>

            <div className="booking-payment-card">
              <h3>Payment details</h3>

              <div className="booking-payment-methods">
                {[
                  {id: "card", label: "Card", icon: "credit-card"},
                  {id: "cash", label: "Cash on departure", icon: "money-bill-wave"},
                  {id: "transfer", label: "Bank transfer", icon: "building-columns"},
                ].map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    className={paymentMethod === m.id ? "booking-pay-method active" : "booking-pay-method"}
                    onClick={() => setPaymentMethod(m.id)}
                  >
                    <i className={`fa-solid fa-${m.icon}`} aria-hidden="true" />
                    {m.label}
                  </button>
                ))}
              </div>

              {paymentMethod === "card" && (
                <div className="booking-card-fields">
                  <div className="booking-field-group">
                    <label htmlFor="pay-card-name">Cardholder name</label>
                    <input id="pay-card-name" type="text" value={cardName} onChange={(e) => setCardName(e.target.value)} placeholder="Name as printed on card" />
                  </div>
                  <div className="booking-field-group">
                    <label htmlFor="pay-card-number">Card number</label>
                    <input id="pay-card-number" type="text" inputMode="numeric" value={cardNumber} onChange={(e) => setCardNumber(e.target.value.replace(/[^\d ]/g, "").slice(0, 19))} placeholder="0000 0000 0000 0000" />
                  </div>
                  <div className="booking-form-grid">
                    <div className="booking-field-group">
                      <label htmlFor="pay-card-expiry">Expiry</label>
                      <input id="pay-card-expiry" type="text" value={cardExpiry} onChange={(e) => setCardExpiry(e.target.value.slice(0, 5))} placeholder="MM/YY" />
                    </div>
                    <div className="booking-field-group">
                      <label htmlFor="pay-card-cvc">CVC</label>
                      <input id="pay-card-cvc" type="text" inputMode="numeric" value={cardCvc} onChange={(e) => setCardCvc(e.target.value.replace(/\D/g, "").slice(0, 4))} placeholder="123" />
                    </div>
                  </div>
                </div>
              )}

              {paymentMethod === "cash" && (
                <p className="booking-pay-note">
                  Pay in cash to the trip organizer at the departure meeting point. Your seats are held for 24 hours.
                </p>
              )}

              {paymentMethod === "transfer" && (
                <p className="booking-pay-note">
                  Bank transfer details will be sent to your email after confirming the booking. Seats are held for 48 hours.
                </p>
              )}

              <div className="booking-pay-total">
                <span>Total to pay</span>
                <strong>{grandTotal.toLocaleString()} $</strong>
              </div>
            </div>

            {submitMessage && <div className="booking-message">{submitMessage}</div>}

            <div className="booking-cta-bar">
              <div>
                <span className="booking-cta-label">Ready to reserve</span>
                <strong>{grandTotal.toLocaleString()} $</strong>
              </div>
              <button className="booking-submit" type="button" onClick={handleSubmit}>
                Confirm booking
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

export default BookingPage
