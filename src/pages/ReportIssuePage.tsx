import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Camera, Copy, LocateFixed, MapPin, ShieldCheck, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Dropdown } from "../components/ui/Dropdown";
import { Input } from "../components/ui/Input";
import { Textarea } from "../components/ui/Textarea";
import { useReferenceData } from "../hooks/useIssues";
import { useMunicipality } from "../context/municipality";
import { isSupabaseConfigured } from "../lib/supabase";
import { createIssue } from "../services/issues";

const MAX_FILE_SIZE = 8 * 1024 * 1024;
const STREETLIGHT_ISSUE_TYPE_ID = "10000000-0000-0000-0000-000000000002";
const formSchema = z.object({
  wardId: z.string().min(1, "Ward is required"),
  issueTypeId: z.string().min(1, "Select an issue type"),
  lampPoleNumber: z.string().trim().max(100).optional(),
  title: z.string().trim().min(5, "Use at least 5 characters").max(120),
  description: z.string().trim().min(5, "Please provide at least 5 characters").max(2000),
  streetAddress: z.string().trim().min(5, "Street address is required").max(250),
  nearestIntersection: z.string().trim().max(250).optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  reporterName: z.string().trim().max(100).optional(),
  reporterEmail: z.union([z.literal(""), z.string().email("Enter a valid email")]).optional(),
}).superRefine((values, context) => {
  if (values.issueTypeId === STREETLIGHT_ISSUE_TYPE_ID && !values.lampPoleNumber?.trim()) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["lampPoleNumber"],
      message: "Lamp pole number is required for streetlight issues",
    });
  }
});

type FormValues = z.infer<typeof formSchema>;

export function ReportIssuePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { wards, issueTypes } = useReferenceData();
  const { selectedMunicipalityId } = useMunicipality();
  const municipalityWards = useMemo(
    () => (wards.data || []).filter((ward) => ward.municipality_id === selectedMunicipalityId),
    [wards.data, selectedMunicipalityId],
  );
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoError, setPhotoError] = useState("");
  const [locationError, setLocationError] = useState("");
  const [locating, setLocating] = useState(false);
  const [descriptionFocused, setDescriptionFocused] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    values: {
      wardId: municipalityWards[0]?.id || "",
      issueTypeId: "",
      lampPoleNumber: "",
      title: "",
      description: "",
      streetAddress: "",
      nearestIntersection: "",
      latitude: undefined,
      longitude: undefined,
      reporterName: "",
      reporterEmail: "",
    },
    resetOptions: { keepDirtyValues: true },
  });
  const title = watch("title");
  const wardId = watch("wardId");
  const issueTypeId = watch("issueTypeId");
  const descriptionField = register("description");
  const isStreetlight = issueTypeId === STREETLIGHT_ISSUE_TYPE_ID;

  useEffect(() => {
    if (!isStreetlight) setValue("lampPoleNumber", "");
  }, [isStreetlight, setValue]);

  const mutation = useMutation({
    mutationFn: (values: FormValues) => createIssue({ ...values, photos }),
    onSuccess: (issue) => {
      void queryClient.invalidateQueries({ queryKey: ["issues"] });
      navigate(`/report/success/${issue.issue_number}`);
    },
  });

  function addPhotos(files: FileList | null) {
    if (!files) return;
    const next = [...photos, ...Array.from(files)];
    if (next.length > 5) {
      setPhotoError("You can upload a maximum of 5 photos.");
      return;
    }
    const invalid = next.find((file) => !file.type.startsWith("image/") || file.size > MAX_FILE_SIZE);
    if (invalid) {
      setPhotoError("Photos must be image files no larger than 8 MB each.");
      return;
    }
    setPhotoError("");
    setPhotos(next);
  }

  function useCurrentLocation() {
    setLocationError("");
    setLocating(true);
    if (!navigator.geolocation) {
      setLocationError("Location is not supported by this browser.");
      setLocating(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setValue("latitude", Number(coords.latitude.toFixed(7)), { shouldValidate: true });
        setValue("longitude", Number(coords.longitude.toFixed(7)), { shouldValidate: true });
        setLocating(false);
      },
      () => {
        setLocationError("We could not access your location. You can enter coordinates manually.");
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 12_000 },
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-5 py-12 lg:px-8 lg:py-16">
      <div className="max-w-2xl">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-clay">New public report</p>
        <h1 className="mt-2 font-display text-4xl font-bold text-civic-950 sm:text-5xl">Report an issue</h1>
        <p className="mt-3 text-stone-500">Give us enough detail to identify the problem and route it correctly.</p>
      </div>

      {!isSupabaseConfigured && (
        <div className="mt-8 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950">
          Supabase environment variables are required before reports can be submitted.
        </div>
      )}

      <form onSubmit={handleSubmit((values) => mutation.mutate(values))} className="mt-9 space-y-6">
        <Card className="p-6 sm:p-8">
          <div className="mb-7 flex items-center gap-3 border-b pb-5">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-civic-50 text-civic-800"><MapPin className="h-5 w-5" /></span>
            <div><h2 className="font-display text-xl font-bold text-civic-950">Issue details</h2><p className="text-sm text-stone-500">What happened, and where?</p></div>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <p className="mb-1.5 text-sm font-semibold text-stone-800">Ward</p>
              <Dropdown
                ariaLabel="Ward"
                value={wardId}
                onChange={(value) => setValue("wardId", value, { shouldDirty: true, shouldValidate: true })}
                options={
                  municipalityWards.length
                    ? municipalityWards.map(({ id, name }) => ({ value: id, label: name }))
                    : [{ value: "", label: "No wards available yet" }]
                }
              />
              {errors.wardId && <p className="mt-1.5 text-xs text-red-700">{errors.wardId.message}</p>}
            </div>
            <div>
              <p className="mb-1.5 text-sm font-semibold text-stone-800">Issue type</p>
              <Dropdown
                ariaLabel="Issue type"
                value={issueTypeId}
                onChange={(value) => setValue("issueTypeId", value, { shouldDirty: true, shouldValidate: true })}
                options={[
                  { value: "", label: "Select an issue type" },
                  ...(issueTypes.data || []).map(({ id, name }) => ({ value: id, label: name })),
                ]}
              />
              {errors.issueTypeId && <p className="mt-1.5 text-xs text-red-700">{errors.issueTypeId.message}</p>}
            </div>
            {isStreetlight && (
              <div className="sm:col-span-2">
                <Input
                  label="Lamp pole number"
                  placeholder="Enter the number shown on the lamp pole"
                  error={errors.lampPoleNumber?.message}
                  {...register("lampPoleNumber")}
                />
              </div>
            )}
            <div className="sm:col-span-2"><Input label="Title" placeholder="e.g. Large pothole blocking left lane" error={errors.title?.message} {...register("title")} /></div>
            <div className="relative sm:col-span-2">
              <Textarea
                label="Description"
                rows={6}
                placeholder="Describe the issue, visible hazards, landmarks and how long it has been present."
                error={errors.description?.message}
                {...descriptionField}
                onFocus={() => setDescriptionFocused(true)}
                onBlur={(event) => {
                  descriptionField.onBlur(event);
                  setDescriptionFocused(false);
                }}
              />
              <button
                type="button"
                disabled={!descriptionFocused || !title.trim()}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => setValue("description", title.trim(), { shouldDirty: true, shouldValidate: true })}
                className="absolute right-2 top-0 inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-bold text-civic-700 transition hover:bg-civic-50 disabled:cursor-not-allowed disabled:opacity-35"
              >
                <Copy className="h-3.5 w-3.5" /> Copy title
              </button>
            </div>
            <Input label="Street address" placeholder="Street number and name, suburb" error={errors.streetAddress?.message} {...register("streetAddress")} />
            <Input label="Nearest intersection" placeholder="Optional" error={errors.nearestIntersection?.message} {...register("nearestIntersection")} />
          </div>
          <div className="mt-5 rounded-xl bg-civic-50 p-4">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <div><p className="text-sm font-bold text-civic-950">Pinpoint the location</p><p className="text-xs text-civic-700">Coordinates help municipal teams find the issue.</p></div>
              <Button type="button" variant="secondary" onClick={useCurrentLocation} loading={locating}><LocateFixed className="h-4 w-4" /> Use current location</Button>
            </div>
            {locationError && <p className="mt-3 text-xs text-red-700">{locationError}</p>}
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Input label="Latitude" type="number" step="any" error={errors.latitude?.message} {...register("latitude", { setValueAs: (value) => value === "" ? undefined : Number(value) })} />
              <Input label="Longitude" type="number" step="any" error={errors.longitude?.message} {...register("longitude", { setValueAs: (value) => value === "" ? undefined : Number(value) })} />
            </div>
          </div>
        </Card>

        <Card className="p-6 sm:p-8">
          <div className="mb-7 flex items-center gap-3 border-b pb-5">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-civic-50 text-civic-800"><Camera className="h-5 w-5" /></span>
            <div><h2 className="font-display text-xl font-bold text-civic-950">Photos</h2><p className="text-sm text-stone-500">Optional, up to 5 images. Maximum 8 MB each.</p></div>
          </div>
          <label className="flex min-h-36 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-civic-200 bg-civic-50/50 p-6 text-center hover:border-civic-500">
            <Camera className="h-7 w-7 text-civic-700" />
            <span className="mt-2 text-sm font-bold text-civic-950">Choose photos</span>
            <span className="mt-1 text-xs text-stone-500">JPG, PNG, HEIC or WebP</span>
            <input type="file" multiple accept="image/*" className="sr-only" onChange={(event) => addPhotos(event.target.files)} />
          </label>
          {photoError && <p className="mt-2 text-xs text-red-700">{photoError}</p>}
          {photos.length > 0 && (
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {photos.map((photo, index) => (
                <div key={`${photo.name}-${index}`} className="flex items-center gap-3 rounded-lg border bg-white p-3">
                  <img src={URL.createObjectURL(photo)} alt="" className="h-12 w-12 rounded-md object-cover" />
                  <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{photo.name}</p><p className="text-xs text-stone-400">{(photo.size / 1024 / 1024).toFixed(1)} MB</p></div>
                  <button type="button" className="p-1 text-stone-400 hover:text-red-700" onClick={() => setPhotos(photos.filter((_, itemIndex) => itemIndex !== index))}><X className="h-4 w-4" /></button>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="p-6 sm:p-8">
          <div className="mb-7 flex items-center gap-3 border-b pb-5">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-civic-50 text-civic-800"><ShieldCheck className="h-5 w-5" /></span>
            <div><h2 className="font-display text-xl font-bold text-civic-950">Your details</h2><p className="text-sm text-stone-500">Receive email updates on your issue. Contact details are not shown publicly.</p></div>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <Input label="Name" placeholder="Optional" error={errors.reporterName?.message} {...register("reporterName")} />
            <Input label="Email" type="email" placeholder="Optional" error={errors.reporterEmail?.message} {...register("reporterEmail")} />
          </div>
        </Card>

        {mutation.isError && <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{mutation.error.message}</div>}
        <div className="flex flex-col items-start justify-between gap-4 rounded-2xl bg-civic-950 p-6 text-white sm:flex-row sm:items-center">
          <p className="max-w-lg text-sm leading-6 text-civic-200">By submitting, you confirm this report is accurate. Issue details and photos will be publicly visible.</p>
          <Button type="submit" className="shrink-0 bg-clay hover:bg-[#c96d3c]" loading={mutation.isPending} disabled={!isSupabaseConfigured}>Submit report</Button>
        </div>
      </form>
    </div>
  );
}
