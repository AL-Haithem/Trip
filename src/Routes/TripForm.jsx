import {useState, useEffect} from "react"
import {useParams, useNavigate} from "react-router"

import {createEmptyTour, DEFAULT_SERVICES} from "../data/models.js"
import {saveTour, getTour} from "../data/tourStore.js"
import {getSession} from "../services/mockApi.js"
import {Input, TextArea} from "../components/ui/Input.jsx"
import Button from "../components/ui/Button.jsx"
import Chip from "../components/ui/Chip.jsx"
import {tripForm as copy} from "../content/siteContent.js"
import "../styles/tripForm.css"

function TripForm() {
  const {id} = useParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()

  const [tour, setTour] = useState(createEmptyTour())
  const [saved, setSaved] = useState(false)
  const sessionCompany = getSession()?.company || null

  useEffect(() => {
    if (!id) return;
    let mounted = true;
    getTour(id).then((data) => {
      if (mounted && data) setTour(data);
    });
    return () => { mounted = false; };
  }, [id])

  const updateField = (field, value) => {
    setTour(prev => ({...prev, [field]: value}));
    setSaved(false);
  };

  const toggleService = (service, list) => {
    setTour(prev => {
      const current = prev[list];
      const exists = current.includes(service);
      const next = exists
        ? current.filter(s => s !== service)
        : [...current, service];
      return {...prev, [list]: next};
    });
    setSaved(false);
  };

  const handleSave = async () => {
    if (!tour.title || tour.title.trim().length === 0) {
      alert(copy.titleRequired);
      return;
    }
    const companyId = tour.companyId || (sessionCompany ? sessionCompany.id : null);
    await saveTour({...tour, companyId});
    setSaved(true);
    navigate("/trips");
  };

  return (
    <div className="tf-page">
      <div className="tf-inner">
        <h1 className="tf-title">{isEdit ? copy.editTitle : copy.createTitle}</h1>

        <Input label={copy.titleLabel} value={tour.title} onChange={(e) => updateField("title", e.target.value)} placeholder={copy.titlePlaceholder} />
        <TextArea label={copy.descriptionLabel} value={tour.description} onChange={(e) => updateField("description", e.target.value)} placeholder={copy.descriptionPlaceholder} />
        <Input label={copy.priceLabel} type="number" min="0" value={tour.price} onChange={(e) => updateField("price", parseFloat(e.target.value) || 0)} />
        <Input label={copy.seatsLabel} type="number" min="0" value={tour.seats} onChange={(e) => updateField("seats", parseInt(e.target.value) || 0)} />

        <label className="tf-label">{copy.includedLabel}</label>
        <div className="tf-chips">
          {DEFAULT_SERVICES.map(service => (
            <Chip
              key={service}
              green={tour.includedServices.includes(service)}
              onClick={() => toggleService(service, "includedServices")}
              className={`tf-chip ${tour.includedServices.includes(service) ? "tf-chip-active" : ""}`}
            >
              {service}
            </Chip>
          ))}
        </div>

        <label className="tf-label">{copy.notIncludedLabel}</label>
        <div className="tf-chips">
          {DEFAULT_SERVICES.map(service => {
            const active = tour.notIncludedServices.includes(service)
            return (
              <Chip
                key={service}
                onClick={() => toggleService(service, "notIncludedServices")}
                className={`tf-chip ${active ? "tf-chip-excluded" : ""}`}
              >
                {service}
              </Chip>
            )
          })}
        </div>

        <Button variant="primary" block onClick={handleSave} className="tf-submit">
          {saved ? copy.saved : copy.save}
        </Button>

        {saved && (
          <p className="tf-saved">{copy.savedMessage}</p>
        )}
      </div>
    </div>
  )
}

export default TripForm
